import { IQuest } from '@/lib/models/Quest';
import { FollowOnTwitter, checkClaimableResult, claimRewardResult } from '@/lib/quests/types';
import UserTwitter from '@/lib/models/UserTwitter';
import { AuthorizationType } from '@/lib/authorization/types';
import { QuestBase } from './base';
import UserMetrics, { Metric, IUserMetrics } from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessage } from '@/lib/kafka/client';
import { ClientSession } from 'mongoose';

export class FollowOnTwitterQuest extends QuestBase {
  // 定义twitter账号与指标的映射关系
  private readonly followMetrics = new Map<string, Metric>([
    [process.env.MOONVEIL_TWITTER_USERNAME!, Metric.TwitterFollowedMoonveil],
    [process.env.ASTRARK_TWITTER_USERNAME!, Metric.TwitterFollowedAstrArk],
  ]);

  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 此处只要用户绑定了twitter账号就行，不强求授权token的有效性
    const userTwitter = await UserTwitter.findOne({ user_id: userId, deleted_time: null });
    if (!userTwitter) {
      return {
        claimable: false,
        require_authorization: AuthorizationType.Twitter,
      };
    }
    return {
      claimable: await this.checkAchieved(userId),
    };
  }

  private checkUserMetric(userId: string): undefined | ((session: ClientSession) => Promise<void>) {
    const questProp = this.quest.properties as FollowOnTwitter;
    const followMetric = this.followMetrics.get(questProp.username);
    let updateMetric = undefined;
    if (followMetric) {
      updateMetric = async (session: any) => {
        await UserMetrics.updateOne(
          { user_id: userId },
          {
            $set: { [followMetric]: 1 },
            $setOnInsert: {
              created_time: Date.now(),
            },
          },
          { upsert: true, session: session },
        );
      };
    }
    return updateMetric;
  }


  async addUserAchievement<T>(userId: string, verified: boolean, extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{})): Promise<void> {
    // 检查是否触发关注指标
    const updateMetric = this.checkUserMetric(userId);
    super.addUserAchievement(userId, verified, updateMetric);
    // 检查当前满足的指标并发送消息
    this.sendBadgeCheckMessage(userId);
  }

  private async sendBadgeCheckMessage(userId: string) {
    const questProp = this.quest.properties as FollowOnTwitter;
    const followMetric = this.followMetrics.get(questProp.username);
    if (followMetric) {
      sendBadgeCheckMessage(userId, followMetric);
    }
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    // 获取用户的twitter
    const userTwitter = await UserTwitter.findOne({ user_id: userId, deleted_time: null });
    if (!userTwitter) {
      return {
        verified: false,
        require_authorization: AuthorizationType.Twitter,
        tip: 'You should connect your Twitter Account first.',
      };
    }
    // 检查用户是否完成任务
    const achieved = await this.checkAchieved(userId);
    if (!achieved) {
      return {
        verified: false,
        tip: 'Please click follow to complete task first.',
      };
    }
    // 检查是否触发关注指标
    const updateMetric = this.checkUserMetric(userId);
    // 污染twitter，确保同一个twitter单任务只能获取一次奖励
    const taint = `${this.quest.id},${AuthorizationType.Twitter},${userTwitter.twitter_id}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, updateMetric);
    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The Twitter Account has already claimed reward.',
      };
    }
    // 检查当前满足的指标并发送消息
    this.sendBadgeCheckMessage(userId);
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ? `You have claimed ${rewardDelta} MB.` : 'Server Internal Error',
    };
  }

  isPrepared(): boolean {
    return true;
  }
}
