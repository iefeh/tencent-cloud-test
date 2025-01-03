import { PipelineStage } from 'mongoose';
import { IQuest } from '@/lib/models/Quest';
import { QuestType, checkClaimableResult, claimRewardResult } from '@/lib/quests/types';
import { QuestBase } from '@/lib/quests/implementations/base';
import { AuthorizationType } from '@/lib/authorization/types';
import User from '@/lib/models/User';
import UserMetrics, { Metric } from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessage } from '@/lib/kafka/client';

export class ConnectEmailQuest extends QuestBase {
  // 用户的授权email_id，在checkClaimable()时设置
  protected user_email_id = '';

  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 此处只要用户绑定了email账号就行，不强求授权token的有效性
    const user = await User.findOne({ user_id: userId, email: { $ne: null }, deleted_time: null });
    this.user_email_id = user?.email;
    return {
      claimable: !!user,
      require_authorization: user ? undefined : AuthorizationType.Email,
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
          $set: { [Metric.EmailConnected]: 1 },
          $setOnInsert: {
            created_time: Date.now(),
          },
        },
        { upsert: true, session: session },
      );
    });
    await sendBadgeCheckMessage(userId, Metric.EmailConnected);
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      let tip: string | undefined = claimableResult.tip;
      return {
        verified: false,
        require_authorization: claimableResult.require_authorization,
        tip: claimableResult.require_authorization ? 'You should connect your Email Account first.' : tip,
      };
    }
    // 污染email，确保同一个email单任务只能获取一次奖励
    const taint = `${this.quest.id},${AuthorizationType.Email},${this.user_email_id}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, async (session) => {
      await UserMetrics.updateOne(
        { user_id: userId },
        {
          $set: { [Metric.EmailConnected]: 1 },
          $setOnInsert: {
            created_time: Date.now(),
          },
        },
        { upsert: true, session: session },
      );
    });

    await sendBadgeCheckMessage(userId, Metric.EmailConnected);

    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The Email Account has already claimed reward.',
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
//                 email_id: 1,
//                 token: "$oauth_tokens"
//             }
export async function queryUserEmailAuthorization(userId: string): Promise<any> {
  return await User.findOne({ user_id: userId, email: { $ne: null }, deleted_time: null });
}

// 校验用户是否绑定了email
export async function verifyConnectEmailQuest(userId: string, quest: IQuest): Promise<checkClaimableResult> {
  const email = await queryUserEmailAuthorization(userId);
  return { claimable: !!email };
}
