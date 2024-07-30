import { getUserFirstWhitelist } from '@/lib/common/user';
import { IQuest } from '@/lib/models/Quest';
import QuestAchievement from '@/lib/models/QuestAchievement';
import UserTokenReward, { UserTokenAuditStatus, UserTokenSourceType } from '@/lib/models/UserTokenReward';
import { isDuplicateKeyError } from '@/lib/mongodb/client';
import doTransaction from '@/lib/mongodb/transaction';
import { QuestBase } from '@/lib/quests/implementations/base';
import { checkClaimableResult, claimRewardResult, TokenDispatch } from '@/lib/quests/types';
import * as Sentry from '@sentry/nextjs';
import { ethers } from 'ethers'

export class TokenDispatchQuest extends QuestBase {
  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    const questProp = this.quest.properties as TokenDispatch;
    const userWl = await getUserFirstWhitelist(userId, questProp.whitelist_id);
    return {
      claimable: !!userWl,
    };
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return {
        verified: false
      };
    }
    const rewardDelta = await this.checkUserTokenDeltaFromWhitelist(userId);
    const result = await this.saveUserRewardWithTaints(userId, rewardDelta);
    return {
      verified: true,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ? `Verify success.` : 'Server Internal Error',
    };
  }

  async decodeTransactionLogs(transaction: string) {
    const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
    const receipt = await provider.getTransactionReceipt(transaction);
    let abi = [ "event ClaimToken(bytes32 indexed reqId, address indexed claimer, address indexed token, uint256 tokenAmount)" ];
    let iface = new ethers.Interface(abi);
    if (receipt) {
      for (let log of receipt.logs) {
        let parsedLog = iface.parseLog({ topics: log.topics as string[], data: log.data});
        if (parsedLog) {
          const { reqId, claimer, token, tokenAmount } = parsedLog.args;
        }
      }
    }
  }

  private async checkUserTokenDeltaFromWhitelist(userId: string): Promise<number> {
    const whitelist = this.quest.properties as TokenDispatch;
    const userWl = await getUserFirstWhitelist(userId, whitelist.whitelist_id);
    if (!userWl || !userWl.reward || !userWl.reward.tokens) {
        throw new Error(`quest ${this.quest.id} user ${userId} whitelist ${whitelist.whitelist_id} reward not properly configured`);
    }
    return userWl?.reward?.tokens!;
  }

  // 保存用户的奖励
  async saveUserRewardWithTaints(userId: string, tokenDelta: number): Promise<{ done: boolean, duplicated: boolean }> {
    const now = Date.now();
    const questProp = this.quest.properties as TokenDispatch;
    try {
      // 保存用户任务达成记录、任务奖励记录、用户MB奖励
      await doTransaction(async (session) => {
        const opts = { session };
        const tokenReward = new UserTokenReward({
          reward_id: ethers.id(`${userId},${this.quest.id}`),
          user_id: userId,
          source_type: UserTokenSourceType.Quest,
          source_id: this.quest.id,
          chain_id: questProp.chain_id,
          token_address: questProp.token_address,
          token_amount: 0,
          status: UserTokenAuditStatus.Pending,
          created_time: Date.now(),
        });
        tokenReward.save(opts);
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
      });
      return {done: true, duplicated: false}
    } catch (error) {
        console.log(error);
        if (isDuplicateKeyError(error)) {
          return {done: false, duplicated: true}
        }
        console.error(error);
        Sentry.captureException(error);
        return {done: false, duplicated: false}
    }
  }
}
