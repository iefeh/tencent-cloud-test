import { PipelineStage } from 'mongoose';
import UserApple from '@/lib/models/UserApple';
import { IQuest } from '@/lib/models/Quest';
import { checkClaimableResult, claimRewardResult } from '@/lib/quests/types';
import { QuestBase } from '@/lib/quests/implementations/base';
import { AuthorizationType } from '@/lib/authorization/types';
import UserMetrics, { Metric, IUserMetrics } from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessage } from '@/lib/kafka/client';
import { IOAuthToken } from '@/lib/models/OAuthToken';

export class ConnectAppleQuest extends QuestBase {
  // 用户的授权apple_id，在checkClaimable()时设置
  protected apple_id = '';
  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 此处只要用户绑定了apple账号就行，不强求授权token的有效性
    const userApple = await UserApple.findOne({ user_id: userId, deleted_time: null });
    if (userApple) {
      this.apple_id = userApple.apple_id;
    }
    return {
      claimable: !!userApple,
      require_authorization: userApple ? undefined : AuthorizationType.Apple,
    };
  }

  async addUserAchievement<T>(
    userId: string,
    verified: boolean,
    extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{}),
  ): Promise<void> {
    await super.addUserAchievement(userId, verified, async (session) => {
      await UserMetrics.updateOne(
        { user_id: userId },
        {
          $set: { [Metric.AppleConnected]: 1 },
          $setOnInsert: {
            created_time: Date.now(),
          },
        },
        { upsert: true, session: session },
      );
    });
    await sendBadgeCheckMessage(userId, Metric.AppleConnected);
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return {
        verified: false,
        require_authorization: claimableResult.require_authorization,
        tip: claimableResult.require_authorization ? 'You should connect your Apple Account first.' : undefined,
      };
    }
    return this.claimUserAppleReward(userId);
  }

  protected async claimUserAppleReward(userId: string): Promise<claimRewardResult> {
    // 污染apple，确保同一个apple单任务只能获取一次奖励
    const taint = `${this.quest.id},${AuthorizationType.Apple},${this.apple_id}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, async (session) => {
      await UserMetrics.updateOne(
        { user_id: userId },
        {
          $set: { [Metric.AppleConnected]: true },
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
        tip: 'The Apple Account has already claimed reward.',
      };
    }
    await sendBadgeCheckMessage(userId, Metric.AppleConnected);
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done
        ? result.tip
          ? result.tip
          : `You have claimed ${rewardDelta} MB.`
        : result.tip
          ? result.tip
          : 'Server Internal Error',
    };
  }
}

// 返回结构：
//            {
//                 user_id: 1,
//                 apple_id: 1,
//                 token: "$oauth_tokens"
//             }
export async function queryUserAppleAuthorization(userId: string): Promise<UserAppleAuthorization> {
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
        let: { platform_id: '$apple_id' },
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
        apple_id: 1,
        token: '$oauth_tokens',
      },
    },
  ];
  const results = await UserApple.aggregate(aggregateQuery);
  return results.length > 0 ? results[0] : null;
}

export type UserAppleAuthorization = {
  user_id: string;
  apple_id: string;
  token: IOAuthToken;
};
