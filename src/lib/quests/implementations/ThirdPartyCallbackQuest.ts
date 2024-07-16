import axios, { isAxiosError } from 'axios';

import { queryUserAuth } from '@/lib/common/user';
import { IQuest } from '@/lib/models/Quest';
import { QuestBase } from '@/lib/quests/implementations/base';
import { checkClaimableResult, claimRewardResult, ThirdPartyCallback } from '@/lib/quests/types';

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
        tip: "No available auth for this user."
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
      } else {
        claimable = false;
        tip = error? error.message: undefined;
        extra = error? { errorCode: error.code }: undefined;
      }
    }
    catch (error) {
      //校验超时或者校验api出错则返回校验失败
      claimable = false;
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
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null);
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
}
