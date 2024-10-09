import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { getUserFirstWhitelist } from '@/lib/common/user';
import logger from '@/lib/logger/winstonLogger';
import { IQuest } from '@/lib/models/Quest';
import QuestAchievement from '@/lib/models/QuestAchievement';
import User from '@/lib/models/User';
import UserMetricReward, {
    checkMetricReward, IUserMetricReward
} from '@/lib/models/UserMetricReward';
import UserMetrics from '@/lib/models/UserMetrics';
import UserMoonBeamAudit, { UserMoonBeamAuditType } from '@/lib/models/UserMoonBeamAudit';
import { isDuplicateKeyError } from '@/lib/mongodb/client';
import doTransaction from '@/lib/mongodb/transaction';
import {
    checkClaimableResult, claimRewardResult, QuestRewardType, QuestType, Whitelist
} from '@/lib/quests/types';
import * as Sentry from '@sentry/nextjs';
import GameTicket from '@/lib/models/GameTicket';
import UserNodeEligibility, { NodeSourceType } from '@/lib/models/UserNodeEligibility';
import GlobalNotification from '@/lib/models/GlobalNotification';
import UserNotifications from '@/lib/models/UserNotifications';
import UserWallet from '@/lib/models/UserWallet';
import ContractNFT from '@/lib/models/ContractNFT';

interface IProjection {
    [key: string]: number;
}

// 任务基类，用户的任务状态：
// 1.是否完成了当前任务，完成/未完成，通过具体任务的checkClaimable()函数判断
// 2.是否已经领取任务奖励，已校验/未校验，通过checkVerified()函数判断
export abstract class QuestBase {
    quest: IQuest;

    protected constructor(quest: IQuest) {
        this.quest = quest;
    }

    // 检查用户是否已完成任务，可以领取奖励
    abstract checkClaimable(userId: string): Promise<checkClaimableResult>;

    // 用户领取对应任务的奖励
    abstract claimReward(userId: string): Promise<claimRewardResult>;

    // 是否预备类任务，预备类任务只要调用prepare接口，即可完成任务
    // 例如：需要上报即可完成的任务
    // 预备类任务需要重写该方法，返回true
    isPrepared(): boolean {
        return false;
    }

    async checkUserRewardDelta(userId: string): Promise<number> {
        // 检查静态任务奖励
        if (this.quest.reward.type == QuestRewardType.Fixed) {
            return this.quest.reward.amount;
        }
        // 检查是否指标奖励
        if (this.quest.reward.range_reward_ids && this.quest.reward.range_reward_ids.length > 0) {
            return this.checkUserRewardDeltaFromUserMetric(userId);
        }
        // 检查是否白名单奖励，
        // 注意最后检查的白名单奖励，即白名单类型任务可以通过名单发放奖励，也可以通过指标发放奖励
        if (this.quest.type == QuestType.Whitelist) {
            return this.checkUserRewardDeltaFromWhitelist(userId);
        }
        throw new Error(`unknown ${this.quest.type} quest ${this.quest.id} reward delta`);
    }

    private async checkUserRewardDeltaFromWhitelist(userId: string): Promise<number> {
        const whitelist = this.quest.properties as Whitelist;
        const userWl = await getUserFirstWhitelist(userId, whitelist.whitelist_id);
        if (!userWl || !userWl.reward || !userWl.reward.moon_beams) {
            throw new Error(`quest ${this.quest.id} user ${userId} whitelist ${whitelist.whitelist_id} reward not properly configured`);
        }
        return userWl?.reward?.moon_beams;
    }

    private async checkUserRewardDeltaFromUserMetric(userId: string): Promise<number> {
        // 动态任务奖励，查询关联的奖励设置，根据设置计算用户奖励
        const rewardIds = this.quest.reward.range_reward_ids;
        const rewards = await UserMetricReward.find({ id: { $in: rewardIds } });
        // 查询需要的用户指标
        const projection: IProjection = { _id: 0 };
        rewards.forEach((reward: IUserMetricReward) => projection[reward.require_metric] = 1);
        const userMetric = await UserMetrics.findOne({ user_id: userId }, projection);
        // 检查用户指标是否存在，不存在时直接报错
        for (let reward of rewards) {
            if (reward.require_metric in userMetric) {
                continue;
            }
            throw new Error(`quest ${this.quest.id} reward ${reward.id} want metric ${reward.require_metric} but not found from user ${userId}`);
        }
        // 计算用户总计奖励数量
        let totalReward = 0;
        rewards.forEach(reward => {
            const userMetricValue = userMetric[reward.require_metric];
            const rewardItem = checkMetricReward(userMetricValue, reward);
            if (rewardItem) {
                logger.debug(`user ${userId} reached ${reward.require_metric} reward MB ${rewardItem.reward_moon_beam}`);
                totalReward += rewardItem.reward_moon_beam!;
            }
        });
        return totalReward;
    }

    // 检查用户是否达成任务
    async checkAchieved(userId: string): Promise<boolean> {
        const achievement = await QuestAchievement.findOne({ user_id: userId, quest_id: this.quest.id });
        return !!achievement;
    }

    // 检查用户是否已经领取任务奖励
    async checkVerified(userId: string): Promise<boolean> {
        const reward = await UserMoonBeamAudit.findOne({ user_id: userId, corr_id: this.quest.id, deleted_time: null });
        return !!reward;
    }

    // 保存用户的任务达成记录
    async addUserAchievement<T>(userId: string, verified: boolean, extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{})): Promise<void> {
        const now = Date.now();
        const inserts: any = {};
        if (verified) {
            inserts.verified_time = now;
        }
        await doTransaction(async (session) => {
            if (extraTxOps) {
                // 执行额外的事务操作
                await extraTxOps(session);
            }
            await QuestAchievement.updateOne(
                { user_id: userId, quest_id: this.quest.id, verified_time: null },
                {
                    $set: inserts,
                    $setOnInsert: {
                        created_time: now,
                    },
                },
                { upsert: true, session: session },
            );
        });
    }

    // 保存用户的奖励，可选回调参数extraTxOps，用于添加额外的事务操作
    async saveUserReward<T>(userId: string, taint: string, rewardDelta: number, extra_info: string | null, extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{})): Promise<{ done: boolean, duplicated: boolean, tip?: string }> {
        if (this.quest.visible_user_ids && this.quest.visible_user_ids.length > 0 && !(this.quest.visible_user_ids.includes(userId))) {
            return { done: false, duplicated: false }
        }

        const now = Date.now();
        const audit = new UserMoonBeamAudit({
            user_id: userId,
            type: UserMoonBeamAuditType.Quests,
            moon_beam_delta: rewardDelta,
            reward_taint: taint,
            corr_id: this.quest.id,
            extra_info: extra_info,
            created_time: now,
        });

        let tickets: any[];
        if (this.quest.reward.game_ticket_reward) {
            tickets = [];
            const amount = Number(this.quest.reward.game_ticket_reward.amount);
            const gameId = String(this.quest.reward.game_ticket_reward.game_id);
            const expiredAt = Number(this.quest.reward.game_ticket_reward.expired_at);

            for (let i = 0; i < amount; i++) {
                const ticket = new GameTicket();
                ticket.pass_id = `QUEST-${ethers.id(`${userId}-${gameId}-${this.quest.id}-${i}`)}`;
                ticket.user_id = userId;
                ticket.game_id = gameId;
                ticket.created_at = Date.now();
                ticket.expired_at = expiredAt;
                tickets.push(ticket);
            }
        }

        let tip = undefined;
        let nodeReward: any;
        if (this.quest.reward.distribute_node) {
            // 检查用户是否已绑定钱包
            const wallet = await UserWallet.findOne({ user_id: userId, deleted_time: null });
            if (!wallet) {
                return { done: false, duplicated: false, tip: 'Binding wallet is required before claiming Node rewards.' };
            }
            nodeReward = {};
            nodeReward.nodes = [new UserNodeEligibility({ user_id: userId, node_tier: this.quest.reward.distribute_node.node_tier, node_amount: this.quest.reward.distribute_node.node_amount, source_type: NodeSourceType.Quest, source_id: this.quest.id, created_time: Date.now() })];
            if (this.quest.reward.distribute_node.notification_id) {
                let notification = await GlobalNotification.findOne({ notification_id: this.quest.reward.distribute_node.notification_id });
                const tier = Number(this.quest.reward.distribute_node.node_tier);
                // nodeReward.notification = new UserNotifications({ user_id: userId, notification_id: uuidv4(), content: notification.content.replace('{tier}', tier > 0 ? `Tier ${tier}` : `FREE`).replace('{task}', this.quest.name), link: notification.link, created_time: Date.now() });
                tip = notification.content.replace('{tier}', tier > 0 ? `Tier ${tier}` : `FREE`).replace('{task}', this.quest.name);
            }
        } else if (this.quest.reward.raffle_node) {
            const wallet = await UserWallet.findOne({ user_id: userId, deleted_time: null });
            if (!wallet) {
                return { done: false, duplicated: false, tip: 'Binding wallet is required before claiming Node rewards.' };
            }
        } else if (this.quest.reward.node_multiplier) {
            const wallet = await UserWallet.findOne({ user_id: userId, deleted_time: null });
            if (!wallet) {
                return { done: false, duplicated: false, tip: 'Binding wallet is required before claiming Node rewards.' };
            }
            const multiplier = this.quest.reward.node_multiplier;
            const holdAmount = await ContractNFT.count({ wallet_addr: wallet.wallet_addr, chain_id: multiplier.chain_id, contract_address: multiplier.contract_address, transaction_status: 'confirmed', deleted_time: null });
            let temp: string = '';
            if (holdAmount) {
                nodeReward = {};
                nodeReward.nodes = []; 
                for (let n of multiplier.per_nft_node) {
                    const node = new UserNodeEligibility({ user_id: userId, node_tier: n.tier, node_amount: holdAmount * n.amount, source_type: NodeSourceType.Quest, source_id: `${this.quest.id},tier:${n.tier}`, created_time: Date.now() });
                    nodeReward.nodes.push(node);
                    if (temp.length == 0) {
                        temp = `${holdAmount * n.amount} Tier ${n.tier} Node`
                    } else {
                        temp = `${temp} and ${holdAmount * n.amount} Tier ${n.tier} Node`
                    }
                }
            }

            if (this.quest.reward.node_multiplier.notification_id) {
                let notification = await GlobalNotification.findOne({ notification_id: this.quest.reward.node_multiplier.notification_id });
                // const tier = Number(this.quest.reward.node_multiplier.node_tier);
                // nodeReward.notification = new UserNotifications({ user_id: userId, notification_id: uuidv4(), content: notification.content.replace('{tier}', tier > 0 ? `Tier ${tier}` : `FREE`).replace('{task}', this.quest.name), link: notification.link, created_time: Date.now() });
                tip = notification.content.replace('{tier}', temp.replace(`1 Tier`, 'a Tier').replace(`Tier 0`, 'free')).replace('{task}', this.quest.name);
            }
        }

        try {
            // 保存用户任务达成记录、任务奖励记录、用户MB奖励
            await doTransaction(async (session) => {
                if (extraTxOps) {
                    // 执行额外的事务操作
                    await extraTxOps(session);
                }
                const opts = { session };
                await QuestAchievement.updateOne(
                    { user_id: userId, quest_id: this.quest.id, verified_time: null },
                    {
                        $set: {
                            verified_time: now,
                        },
                        $setOnInsert: {
                            created_time: now,
                        },
                    },
                    { upsert: true, session: session },
                );
                await audit.save(opts);
                await User.updateOne({ user_id: userId }, { $inc: { moon_beam: audit.moon_beam_delta } }, opts);
                if (tickets) {
                    await GameTicket.insertMany(tickets, { session: session });
                }

                if (nodeReward) {
                    await UserNodeEligibility.insertMany(nodeReward.nodes, { session: session })
                }
            });
            return { done: true, duplicated: false, tip: tip }
        } catch (error) {
            if (isDuplicateKeyError(error)) {
                return { done: false, duplicated: true }
            }
            console.error(error);
            Sentry.captureException(error);
            return { done: false, duplicated: false }
        }
    }
}

