import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import Campaign, { CampaignClaimSettings, CampaignRewardType, CampaignStatus } from "@/lib/models/Campaign";
import { enrichUserTasks } from "@/lib/quests/taskEnrichment";
import CampaignAchievement from "@/lib/models/CampaignAchievement";
import RewardAccelerator from "@/lib/models/RewardAccelerator";
import { RewardAcceleratorType } from "@/lib/accelerator/types";
import Badges from "@/lib/models/Badge";
import { getMaxLevelBadge } from "@/pages/api/badges/display"
import UserBadges from "@/lib/models/UserBadges";
import UserWallet from "@/lib/models/UserWallet";
import ContractNFT from "@/lib/models/ContractNFT";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
    const { campaign_id } = req.query;
    if (!campaign_id) {
        res.json(response.invalidParams());
        return
    }
    const userId = req.userId!;
    // 查询活动
    const campaign: any = await Campaign.findOne({ id: campaign_id, active: true, deleted_time: null }, {
        _id: 0,
        active: 0,
        created_time: 0,
        updated_time: 0,
        deleted_time: 0
    }).lean();
    if (!campaign) {
        res.json(response.notFound("Unknown campaign."));
        return;
    }
    await enrichCampaign(userId, campaign);
    res.json(response.success({
        campaign: campaign,
    }));
});

async function enrichCampaign(userId: string, campaign: any) {
    setCampaignStatus(campaign);
    await setCampaignBadgeImage(campaign);
    await enrichCampaignClaimed(userId, campaign);
    await enrichUserTasks(userId, campaign.tasks, campaign.claimed);
    await enrichCampaignClaimable(userId, campaign);
    await enrichCampaignClaimAccelerators(userId, campaign);
}

async function setCampaignBadgeImage(campaign: any) {
    for (let c of campaign.rewards) {
        if (c.type == "badge") {
            let targetBadge = await getMaxLevelBadge(c.badge_id);
            c.name = targetBadge.name;
            c.image_small = targetBadge.icon_url;
            c.image_medium = targetBadge.image_url;
        }
    }
}
async function enrichCampaignClaimed(userId: string, campaign: any) {
    campaign.claimed = false;
    if (!userId) {
        return;
    }
    // 检查当前是否已经领取活动任务奖励
    const claim = await CampaignAchievement.findOne({ user_id: userId, campaign_id: campaign.id }, { _id: 0 });
    campaign.claimed = !!claim && !!claim.claimed_time;
}

async function enrichCampaignClaimable(userId: string, campaign: any) {
    if (campaign.claimed) {
        return;
    }
    // 检查当前是否可以领取活动任务奖励
    campaign.claimable = false;
    let tasksCompleted = true;
    for (const task of campaign.tasks) {
        if (!task.verified) {
            tasksCompleted = false;
            break;
        }
    }
    if (tasksCompleted) {
        campaign.claimable = true;
    }
}

async function enrichCampaignClaimAccelerators(userId: string, campaign: any) {
    const claimSettings = campaign.claim_settings as CampaignClaimSettings;
    const rewardAcceleratorIds = claimSettings?.reward_accelerators;
    if (!claimSettings || !rewardAcceleratorIds || rewardAcceleratorIds.length === 0) {
        return;
    }
    campaign.claim_settings.reward_accelerators = [];
    // 查询活动加速器
    const accelerators = await RewardAccelerator.find({ id: { $in: rewardAcceleratorIds } }, {
        _id: 0,
        created_time: 0,
        "properties.chain_id": 0,
        //"properties.contract_address": 0,
    }).lean();
    // 依据原始加速器的顺序进行排序
    campaign.claim_settings.reward_accelerators = rewardAcceleratorIds.map(id => accelerators.find(acc => acc.id === id));
    // 检查如为NFT持有者奖励加速器时，添加当前活动加速器的单个NFT奖励
    const baseMbAmount = campaign.rewards.reduce((acc: any, reward: any) => {
        if (reward.type === CampaignRewardType.MoonBeam) {
            return acc + reward.amount;
        }
        return acc;
    }, 0);
    await calculateAcceleratorResult(userId, baseMbAmount, campaign);
}

function setCampaignStatus(campaign: any) {
    if (campaign.start_time > Date.now()) {
        campaign.status = CampaignStatus.Upcoming;
        return;
    }
    if (campaign.end_time < Date.now()) {
        campaign.status = CampaignStatus.Ended;
        return;
    }
    campaign.status = CampaignStatus.Ongoing;
}

async function calculateAcceleratorResult(userId: string, baseMbAmount: number, campaign: any) {
    //初始化总的加速效果
    campaign.claim_settings.total_reward_bonus = 0;
    campaign.claim_settings.total_reward_bonus_moon_beam = 0;
    for (let accelerator of campaign.claim_settings.reward_accelerators) {
        if (accelerator.type == RewardAcceleratorType.NFTHolder) {
            //初始化该加速器加速效果
            accelerator.properties.reward_bonus_moon_beam = 0;
            //查询钱包地址
            const wallet = await UserWallet.findOne({ user_id: userId, deleted_time: null });
            if (!wallet) {
                accelerator.properties.reward_bonus = 0;
                continue;
            }
            //判断是否持有对应NFT
            const nft = await ContractNFT.findOne({ wallet_addr: wallet.wallet_addr, deleted_time: null, contract_address: accelerator.properties.contract_address, transaction_status: "confirmed" });
            if (nft) {
                accelerator.properties.reward_bonus_moon_beam = Math.ceil(baseMbAmount * accelerator.properties.reward_bonus);
            } else {
                accelerator.properties.reward_bonus = 0;
            }
            // 求和加速效果
            campaign.claim_settings.total_reward_bonus += accelerator.properties.reward_bonus;
            campaign.claim_settings.total_reward_bonus_moon_beam += accelerator.properties.reward_bonus_moon_beam;
            delete accelerator.properties.contract_address;
        }
        if (accelerator.type == RewardAcceleratorType.BadgeHolder) {
            const userBadge = await UserBadges.findOne({ user_id: userId, badge_id: accelerator.properties.badge_id });
            //初始化加速器加速效果
            accelerator.properties.reward_bonus = 0;
            accelerator.properties.reward_bonus_moon_beam = 0;
            if (userBadge) {
                let bonusLv: number = 0;
                // 判断用户是否达成加速器条件
                for (let s of accelerator.properties.series) {
                    // 持有徽章且已领取，则认为有效
                    if (userBadge.series.get(String(s.lv)) != undefined && userBadge.series.get(String(s.lv)).claimed_time != undefined) {
                        if (accelerator.properties.support_stacking) {
                            accelerator.properties.reward_bonus += s.reward_bonus;
                            accelerator.properties.reward_bonus_moon_beam += Math.ceil(baseMbAmount * accelerator.properties.reward_bonus);
                        } else {
                            if (s.lv > bonusLv) {
                                // 计算奖励Mb
                                accelerator.properties.reward_bonus = s.reward_bonus;
                                accelerator.properties.reward_bonus_moon_beam = Math.ceil(baseMbAmount * accelerator.properties.reward_bonus);
                                bonusLv = s.lv;
                            }
                        }
                    }
                };
                accelerator.name = `${accelerator.name} Lv${bonusLv}`;
            }
            // 求和加速效果
            campaign.claim_settings.total_reward_bonus += accelerator.properties.reward_bonus;
            campaign.claim_settings.total_reward_bonus_moon_beam += accelerator.properties.reward_bonus_moon_beam;
            //移除徽章加速器具体配置
            delete accelerator.properties.series;
        }
    }
}
// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});