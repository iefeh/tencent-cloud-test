import { PipelineStage } from 'mongoose';
import UserApple from '@/lib/models/UserApple';
import { IQuest } from '@/lib/models/Quest';
import { QuestType, checkClaimableResult, claimRewardResult } from '@/lib/quests/types';
import { QuestBase } from '@/lib/quests/implementations/base';
import { AuthorizationType } from '@/lib/authorization/types';
import UserMetrics, { Metric } from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessage } from '@/lib/kafka/client';

export class ConnectAppleQuest extends QuestBase {
  // 用户的授权apple_id，在checkClaimable()时设置
  protected user_apple_id = '';

  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 此处只要用户绑定了apple账号就行，不强求授权token的有效性
    const userApple = await UserApple.findOne({ user_id: userId, deleted_time: null });
    this.user_apple_id = userApple?.apple_id;
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
      let tip: string | undefined = claimableResult.tip;
      return {
        verified: false,
        require_authorization: claimableResult.require_authorization,
        tip: claimableResult.require_authorization ? 'You should connect your Apple Account first.' : tip,
      };
    }
    // 污染apple，确保同一个apple单任务只能获取一次奖励
    const taint = `${this.quest.id},${AuthorizationType.Apple},${this.user_apple_id}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, async (session) => {
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

    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The Apple Account has already claimed reward.',
      };
    }

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
export async function queryUserAppleAuthorization(userId: string): Promise<any> {
  return await UserApple.findOne({ user_id: userId, deleted_time: null });
}

// 校验用户是否绑定了apple
export async function verifyConnectAppleQuest(userId: string, quest: IQuest): Promise<checkClaimableResult> {
  const apple = await queryUserAppleAuthorization(userId);
  return { claimable: !!apple };
}
