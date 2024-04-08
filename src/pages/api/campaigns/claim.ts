import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import logger from "@/lib/logger/winstonLogger";
import {redis} from "@/lib/redis/client";
import * as Sentry from "@sentry/nextjs";
import {errorInterceptor} from "@/lib/middleware/error";
import {timeoutInterceptor} from "@/lib/middleware/timeout";
import Campaign, {CampaignRewardType, ICampaign} from "@/lib/models/Campaign";
import QuestAchievement from "@/lib/models/QuestAchievement";
import RewardAccelerator, {IRewardAccelerator} from "@/lib/models/RewardAccelerator";
import {NftHolderReward, RewardAcceleratorType} from "@/lib/accelerator/types";
import {NftHolderAccelerator} from "@/lib/accelerator/implementations/nftHolder";
import UserWallet, {IUserWallet} from "@/lib/models/UserWallet";
import UserMoonBeamAudit, {UserMoonBeamAuditType} from "@/lib/models/UserMoonBeamAudit";
import CampaignAchievement from "@/lib/models/CampaignAchievement";
import doTransaction from "@/lib/mongodb/transaction";
import User from "@/lib/models/User";
import {try2AddUsers2MBLeaderboard} from "@/lib/redis/moonBeamLeaderboard";

const router = createRouter<UserContextRequest, NextApiResponse>();


const defaultErrorResponse = response.success({
    verified: false,
    tip: "Network busy, please try again later.",
})

router.use(errorInterceptor(defaultErrorResponse), mustAuthInterceptor, timeoutInterceptor(defaultErrorResponse, 15000)).post(async (req, res) => {
    const campaign = await checkClaimCampaignPrerequisite(req, res);
    if (!campaign) {
        return;
    }
    const userId = req.userId!;
    // 用户已经完成了所有任务，计算任务奖励
    const lockKey = `claim_campaign_reward_lock:${campaign.id}:${userId}`;
    try {
        // 尝试设置任务锁
        const locked = await redis.set(lockKey, Date.now(), "EX", 30, "NX");
        if (!locked) {
            return res.json(response.success({
                claimed: false,
                tip: "Verification is under a 30s waiting period, please try again later.",
            }));
        }
        const totalMB = await claimCampaignRewards(userId, campaign);
        if (totalMB > 0) {
            await try2AddUsers2MBLeaderboard(userId);
        }
        // 检查用户是否已经完成所有任务
        res.json(response.success({
            claimed: true,
            tip: totalMB ? `You have claimed rewards, included ${totalMB} MB.` : "You have claimed rewards.",
        }));
    } finally {
        // 释放任务锁
        await redis.del(lockKey);
    }
});

async function checkClaimCampaignPrerequisite(req: any, res: any): Promise<ICampaign | null> {
    const {campaign_id} = req.body;
    if (!campaign_id) {
        res.json(response.invalidParams());
        return null;
    }
    const userId = req.userId!;
    // 查询活动
    const campaign = await Campaign.findOne({id: campaign_id, active: true, deleted_time: null}, {
        _id: 0,
        description: 0
    });
    if (!campaign) {
        res.json(response.notFound("Unknown campaign."));
        return null;
    }
    // 活动当前必须在进行中才可
    const now = Date.now();
    if (campaign.start_time > now || campaign.end_time <= now) {
        res.json(response.notFound("Campaign not ongoing."));
        return null;
    }
    // 检查用户是否已经领取过奖励
    const claimed = await CampaignAchievement.findOne({
        campaign_id: campaign_id,
        user_id: userId,
        claimed_time: {$gt: 0}
    });
    if (claimed) {
        res.json(response.success({
            claimed: false,
            tip: "You have already claimed rewards.",
        }));
        return null;
    }
    // 检查所有的任务完成情况
    const tasks = campaign.tasks;
    const taskIds = tasks.map((t: any) => t.id);
    // 查询用户所有已经校验的任务
    const questAchievements = await QuestAchievement.find({
        user_id: userId,
        quest_id: {$in: taskIds},
        verified_time: {$gt: 0},
    }, {
        _id: 0,
        quest_id: 1
    });
    if (!questAchievements || questAchievements.length != taskIds.length) {
        res.json(response.success({
            claimed: false,
            tip: "Please complete all tasks first.",
        }));
        return null;
    }
    return campaign;
}

async function claimCampaignRewards(userId: string, campaign: ICampaign): Promise<number> {
    const audits = await constructUserMbReward(userId, campaign);
    // 计算用户最终获得的总的MB奖励
    const totalMbDelta = audits.reduce((acc, audit) => acc + audit.moon_beam_delta, 0);
    // 添加用户的活动奖励领取记录
    const now = Date.now();
    await doTransaction(async (session) => {
        const opts = {session};
        // 保存用户的活动奖励领取记录
        await CampaignAchievement.updateOne(
            {user_id: userId, campaign_id: campaign.id, claimed_time: null},
            {
                $set: {
                    claimed_time: now,
                },
                $setOnInsert: {
                    created_time: now,
                },
            },
            {upsert: true, session: session},
        );
        if (totalMbDelta <= 0) {
            return;
        }
        // 保存用户的MB奖励记录
        for (let audit of audits) {
            await audit.save(opts);
        }
        // 更新用户的MB余额
        await User.updateOne({user_id: userId}, {$inc: {moon_beam: totalMbDelta}}, opts);
    });
    return totalMbDelta;
}

// 构建用户活动的MB奖励
async function constructUserMbReward(userId: string, campaign: ICampaign): Promise<any[]> {
    // 计算活动的基础MB奖励
    const audits = constructUserBaseMbReward(userId, campaign);
    if (audits.length === 0) {
        return audits;
    }
    const baseAudit = audits[0];
    // 计算活动的加成MB奖励
    const acceleratedAudits = await constructUserAcceleratedMbReward(userId, campaign, baseAudit.moon_beam_delta);
    return [baseAudit, ...acceleratedAudits];
}

// 构建用户活动的加成MB奖励
async function constructUserAcceleratedMbReward(userId: string, campaign: ICampaign, baseMbReward: number): Promise<any[]> {
    // 检查活动奖励加速设置
    const rewardAccelerators = campaign.claim_settings.reward_accelerators;
    if (!rewardAccelerators || rewardAccelerators.length === 0) {
        return [];
    }
    // 封装加速需要的用户信息
    const userinfo = new Map<RewardAcceleratorType, any>();
    const audits: any[] = [];
    // 计算用户的加速器加成
    const accelerators = await RewardAccelerator.find({id: {$in: rewardAccelerators}}) as IRewardAccelerator[];
    for (let accelerator of accelerators) {
        switch (accelerator.type) {
            case RewardAcceleratorType.NFTHolder:
                if (!userinfo.has(accelerator.type)) {
                    // 需要查询用户的绑定的钱包地址
                    const wallet = await UserWallet.findOne({user_id: userId, deleted_time: null}) as IUserWallet;
                    userinfo.set(accelerator.type, wallet?.wallet_addr);
                }
                const wallet = userinfo.get(accelerator.type);
                if (!wallet) {
                    // 用户没有绑定钱包地址，跳过
                    continue;
                }
                // NFT持有者加速器
                const nftHolderAccelerator = new NftHolderAccelerator(accelerator);
                const reward: NftHolderReward = {
                    wallet_address: wallet,
                    base_moon_beam: baseMbReward,
                    bonus_moon_beam: 0,
                };
                const holderReward = await nftHolderAccelerator.accelerate(reward);
                logger.info(`User ${userId} accelerated ${holderReward.bonus_moon_beam} MB from campaign ${campaign.id} accelerator ${accelerator.id}.`);
                if (holderReward.bonus_moon_beam == 0) {
                    continue;
                }
                // 限制钱包参与同一个活动的加速器只能领取一次
                const taint = `${campaign.id},${accelerator.id},wallet,${wallet}`
                audits.push(new UserMoonBeamAudit({
                    user_id: userId,
                    type: UserMoonBeamAuditType.CampaignBonus,
                    moon_beam_delta: holderReward.bonus_moon_beam,
                    reward_taint: taint,
                    corr_id: campaign.id,
                    extra_info: accelerator.id,
                    created_time: Date.now(),
                }));
        }
    }
    return audits;
}

function constructUserBaseMbReward(userId: string, campaign: ICampaign): any[] {
    // 计算活动的基础MB奖励
    const baseMbAmount = campaign.rewards.reduce((acc, reward) => {
        if (reward.type === CampaignRewardType.MoonBeam) {
            return acc + reward.amount;
        }
        return acc;
    }, 0);
    if (baseMbAmount === 0) {
        return [];
    }
    const taint = `${campaign.id},user,${userId}`
    const baseAudit = new UserMoonBeamAudit({
        user_id: userId,
        type: UserMoonBeamAuditType.Campaigns,
        moon_beam_delta: baseMbAmount,
        reward_taint: taint,
        corr_id: campaign.id,
        extra_info: null,
        created_time: Date.now(),
    })
    return [baseAudit];
}

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler();