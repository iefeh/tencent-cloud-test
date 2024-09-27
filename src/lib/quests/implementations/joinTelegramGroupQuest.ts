import { IQuest } from '@/lib/models/Quest';
import { checkClaimableResult, claimRewardResult, JoinTelegramGroup } from '@/lib/quests/types';
import { AuthorizationType } from '@/lib/authorization/types';
import logger from '@/lib/logger/winstonLogger';
import * as Sentry from '@sentry/nextjs';
import UserMetrics, { IUserMetrics, Metric } from '@/lib/models/UserMetrics';
import { QuestBase } from './base';
import { sendBadgeCheckMessage, sendBadgeCheckMessages } from '@/lib/kafka/client';
import { ClientSession } from 'mongoose';
import UserTelegram from '@/lib/models/UserTelegram';
import axios from 'axios';

export class JoinTelegramGroupQuest extends QuestBase {
  // 用户的授权telegram_id，在checkClaimable()时设置
  private user_telegram_id = '';

  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 检查用户是否绑定Telegram账号
    const telegram = await UserTelegram.findOne({ user_id: userId, deleted_time: null });
    if (!telegram) {
      logger.debug(`user ${userId} require telegram auth to verify quest ${this.quest.id}`);
      // 当前用户未绑定telegram或者用户的授权token已经失效，需要用户重新绑定
      return { claimable: false, require_authorization: AuthorizationType.Telegram };
    }
    this.user_telegram_id = telegram.telegram_id;
    const questProp = this.quest.properties as JoinTelegramGroup;

    // 检查用户是否加入对应服务器
    try {
      const telegramRequest = axios.create({ baseURL: process.env.TELEGRAM_BOT_SERVER_URL });
      const response = await telegramRequest.get(`/telegram/member`, {
        params: { member_id: this.user_telegram_id, chat_id: questProp.chat_id },
      });
      if (!response || !response.data) {
        logger.warn(`user ${this.user_telegram_id} verify quest ${this.quest.id} but no response`);
        return { claimable: false, tip: 'No response from remove server.' };
      }

      if (response.data.code != 1) {
        logger.warn(`user ${this.user_telegram_id} verify quest ${this.quest.id} error: ${response.data.msg}`);
        return { claimable: false, tip: response.data.msg };
      }

      if (!response.data.data) {
        logger.warn(`user ${this.user_telegram_id} no info in telegram group ${questProp.chat_id}`);
        return { claimable: false, tip: 'Remote server respond with no data.' };
      }

      if (response.data.data.status == 'left') {
        logger.warn(`user ${this.user_telegram_id} left telegram group ${questProp.chat_id}`);
        return { claimable: false, tip: 'User has already left Telegram group.' };
      }

      if (response.data.data.status == 'kicked') {
        logger.warn(`user ${this.user_telegram_id} kicked in telegram group ${questProp.chat_id}`);
        return { claimable: false, tip: 'User is kicked from Telegram group.' };
      }

      logger.debug(`user ${userId} joined telegram group ${process.env.MOOVEIL_TELEGRAM_CHAT_ID}`);
      return { claimable: true };
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    }
    return { claimable: false, tip: 'Internal server error' };
  }

  async addUserAchievement<T>(
    userId: string,
    verified: boolean,
    extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{}),
  ): Promise<void> {
    const updateMetric = this.checkUserMetric(userId);
    await super.addUserAchievement(userId, verified, updateMetric);
    await this.sendBadgeCheckMessage(userId);
  }

  private async sendBadgeCheckMessage(userId: string) {
    const questProp = this.quest.properties as JoinTelegramGroup;
    await sendBadgeCheckMessages(userId, {
      [Metric.TelegramJoinedMoonveil]: 1,
      [Metric.TelegramConnected]: 1,
    });
  }

  private checkUserMetric(userId: string): undefined | ((session: ClientSession) => Promise<void>) {
    const questProp = this.quest.properties as JoinTelegramGroup;
    let updateMetric = async (session: any) => {
      await UserMetrics.updateOne(
        { user_id: userId },
        {
          $set: {
            [Metric.TelegramJoinedMoonveil]: 1,
            [Metric.TelegramConnected]: 1,
          },
          $setOnInsert: {
            created_time: Date.now(),
          },
        },
        { upsert: true, session: session },
      );
    };
    return updateMetric;
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return {
        verified: false,
        require_authorization: claimableResult.require_authorization,
        tip: claimableResult.require_authorization
          ? 'You should connect your Telegram Account first.'
          : claimableResult.tip,
      };
    }

    // 检查是否触发关注指标
    const updateMetric = this.checkUserMetric(userId);

    // 污染telegram，确保同一个telegram单任务只能获取一次奖励
    const taint = `${this.quest.id},${AuthorizationType.Telegram},${this.user_telegram_id}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, updateMetric);
    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The Telegram Account has already claimed reward.',
      };
    }
    await this.sendBadgeCheckMessage(userId);
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ? `You have claimed ${rewardDelta} MB.` : result.tip ? result.tip : 'Server Internal Error',
    };
  }
}
