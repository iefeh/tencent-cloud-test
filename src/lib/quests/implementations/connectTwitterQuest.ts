import { PipelineStage } from 'mongoose';
import UserTwitter from '@/lib/models/UserTwitter';
import { IQuest } from '@/lib/models/Quest';
import { checkClaimableResult, claimRewardResult } from '@/lib/quests/types';
import { QuestBase } from '@/lib/quests/implementations/base';
import { AuthorizationType } from '@/lib/authorization/types';
import UserMetrics, { Metric, IUserMetrics } from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessage } from '@/lib/kafka/client';
import { IOAuthToken } from '@/lib/models/OAuthToken';

export class ConnectTwitterQuest extends QuestBase {
  // 用户的授权twitter_id，在checkClaimable()时设置
  protected twitter_id = "";
  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 此处只要用户绑定了twitter账号就行，不强求授权token的有效性
    const userTwitter = await UserTwitter.findOne({ user_id: userId, deleted_time: null });
    if (userTwitter) {
      this.twitter_id = userTwitter.twitter_id;
    }
    return {
      claimable: !!userTwitter,
      require_authorization: userTwitter ? undefined : AuthorizationType.Twitter,
    };
  }

  async addUserAchievement<T>(userId: string, verified: boolean, extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{})): Promise<void> {
    await super.addUserAchievement(userId, verified, async (session) => {
      await UserMetrics.updateOne(
        { user_id: userId },
        {
          $set: { [Metric.TwitterConnected]: 1 },
          $setOnInsert: {
            created_time: Date.now(),
          },
        },
        { upsert: true, session: session },
      );
    });
    await sendBadgeCheckMessage(userId, Metric.TwitterConnected);
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return {
        verified: false,
        require_authorization: claimableResult.require_authorization,
        tip: claimableResult.require_authorization ? "You should connect your Twitter Account first." : undefined,
      }
    }
    return this.claimUserTwitterReward(userId);
  }

  protected async claimUserTwitterReward(userId: string): Promise<claimRewardResult> {
    // 污染twitter，确保同一个twitter单任务只能获取一次奖励
    const taint = `${this.quest.id},${AuthorizationType.Twitter},${this.twitter_id}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, async (session) => {
      await UserMetrics.updateOne(
        { user_id: userId },
        {
          $set: { [Metric.TwitterConnected]: true },
          $setOnInsert: {
            created_time: Date.now(),
          },
        },
        { upsert: true, session: session },
      );
    });
    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The Twitter Account has already claimed reward.',
      };
    }
    await sendBadgeCheckMessage(userId, Metric.TwitterConnected);
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ?  result.tip ? result.tip : `You have claimed ${rewardDelta} MB.` : result.tip ? result.tip : 'Server Internal Error',
    };
  }
}

// 返回结构：
//            {
//                 user_id: 1,
//                 twitter_id: 1,
//                 token: "$oauth_tokens"
//             }
export async function queryUserTwitterAuthorization(userId: string): Promise<UserTwitterAuthorization> {
  const aggregateQuery: PipelineStage[] = [
    {
      $match: {
        user_id: userId,
        deleted_time: null,
      },
    },
    {
      $lookup: {
        from: 'oauth_tokens',
        let: { platform_id: '$twitter_id' },
        pipeline: [
          // 联表时过滤已删除的记录
          {
            $match: { $expr: { $and: [{ $eq: ['$platform_id', '$$platform_id'] }, { $eq: ['$deleted_time', null] }] } },
          },
        ],
        as: 'oauth_tokens',
      },
    },
    {
      $unwind: '$oauth_tokens',
    },
    {
      $project: {
        _id: 0,
        user_id: 1,
        twitter_id: 1,
        token: '$oauth_tokens',
      },
    },
  ];
  const results = await UserTwitter.aggregate(aggregateQuery);
  return results.length > 0 ? results[0] : null;
}

export type UserTwitterAuthorization = {
  user_id: string;
  twitter_id: string;
  token: IOAuthToken;
}
