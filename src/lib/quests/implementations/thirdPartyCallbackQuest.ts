import axios, { isAxiosError } from 'axios';

import { AuthorizationType } from '@/lib/authorization/types';
import { queryUserAuth } from '@/lib/common/user';
import { IQuest } from '@/lib/models/Quest';
import QuestAchievement from '@/lib/models/QuestAchievement';
import User from '@/lib/models/User';
import UserMoonBeamAudit, { UserMoonBeamAuditType } from '@/lib/models/UserMoonBeamAudit';
import { isDuplicateKeyError } from '@/lib/mongodb/client';
import doTransaction from '@/lib/mongodb/transaction';
import { QuestBase } from '@/lib/quests/implementations/base';
import { checkClaimableResult, claimRewardResult, ThirdPartyCallback } from '@/lib/quests/types';
import * as Sentry from '@sentry/nextjs';

export class ThirdPartyCallbackQuest extends QuestBase {
  // 用户的授权email, twitter_id, discord_id, 钱包地址, 在checkClaimable()时设置
  protected email = "";
  protected twitter = "";
  protected discord = "";
  protected address = "";
  
  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    const questProp = this.quest.properties as ThirdPartyCallback;
    const userAuth = await queryUserAuth(userId);
    if (userAuth.email) {
      this.email = userAuth.email;
    }
    if (userAuth.twitter) {
      this.twitter = userAuth.twitter.id;
    }
    if (userAuth.discord) {
      this.discord = userAuth.discord.id;
    }
    if (userAuth.wallet) {
      this.address = userAuth.wallet;
    }
    if (!this.email && !this.twitter && !this.discord && !this.address) {
      return {
        claimable: false,
        tip: "No available auth identity for this user."
      };
    }
    const headers: any = {};
    for (let header of questProp.custom_headers) {
      headers[header.name] = header.value;
    }
    const params = new URLSearchParams();
    params.append('email', this.email);
    params.append('twitter', this.twitter);
    params.append('discord', this.discord);
    params.append('address', this.address);
    params.append('start_time', this.quest.start_time.toString());
    params.append('end_time', this.quest.end_time.toString());
    let claimable = false;
    let tip = undefined;
    let extra = undefined;
    // 以post方式调用第三方接口并设置5s的超时时间, 如果超时则认为验证失败
    try {
      const response = await axios.post(questProp.endpoint, params, { headers: headers, timeout: 5 * 1000 });
      const result = response.data.data.result;
      const error = response.data.data.error;
      if (result) {
        claimable = !!result.achieved;
        if (!claimable) {
          tip = error? error.message: "Something wrong, please try again later.";
          extra = error? { errorCode: error.code }: undefined;
        }
      } else {
        claimable = false;
        tip = error? error.message: undefined;
        extra = error? { errorCode: error.code }: undefined;
      }
    }
    catch (error) {
      //校验超时或者校验api出错则返回校验失败
      claimable = false;
      tip = "Something wrong, please try again later.";
      if (!isAxiosError(error)) {
        throw error;
      }
    }
    return {
      claimable: claimable,
      tip: tip,
      extra: extra
    };
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return {
        verified: false,
        tip: claimableResult.tip,
        extra: claimableResult.extra
      };
    } 
    const taint = `${this.quest.id},${userId}`;
    let taints = [];
    if (this.email) {
      taints.push(`${this.quest.id},${AuthorizationType.Email},${this.email}`);
    }
    if (this.twitter) {
      taints.push(`${this.quest.id},${AuthorizationType.Twitter},${this.twitter}`);
    }
    if (this.discord) {
      taints.push(`${this.quest.id},${AuthorizationType.Discord},${this.discord}`);
    }
    if (this.address) {
      taints.push(`${this.quest.id},${AuthorizationType.Wallet},${this.address}`);
    }
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserRewardWithTaints(userId, taint, taints, rewardDelta);
    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The User has already claimed reward.',
      };
    }
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ? `You have claimed ${rewardDelta} MB.` : 'Server Internal Error',
    };
  }

  // 保存用户的奖励
  async saveUserRewardWithTaints(userId: string, taint: string, taints: string[], moonBeamDelta: number): Promise<{ done: boolean, duplicated: boolean }> {
    const now = Date.now();
    const audit = new UserMoonBeamAudit({
        user_id: userId,
        type: UserMoonBeamAuditType.Quests,
        moon_beam_delta: moonBeamDelta,
        reward_taint: taint,
        reward_taints: taints,
        corr_id: this.quest.id,
        created_time: now,
    });
    try {
        // 保存用户任务达成记录、任务奖励记录、用户MB奖励
        await doTransaction(async (session) => {
            const opts = {session};
            await QuestAchievement.updateOne(
                {user_id: userId, quest_id: this.quest.id, verified_time: null},
                {
                    $set: {
                        verified_time: now,
                    },
                    $setOnInsert: {
                        created_time: now,
                    },
                },
                {upsert: true, session: session},
            );
            await audit.save(opts);
            await User.updateOne({user_id: userId}, {$inc: {moon_beam: audit.moon_beam_delta}}, opts);
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
