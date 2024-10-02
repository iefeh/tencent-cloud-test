import { IQuest } from '@/lib/models/Quest';
import { checkClaimableResult, claimRewardResult, JoinDiscordServer } from '@/lib/quests/types';
import { ConnectDiscordQuest, queryUserDiscordAuthorization } from '@/lib/quests/implementations/connectDiscordQuest';
import { AuthorizationType } from '@/lib/authorization/types';
import { discordOAuthProvider } from '@/lib/authorization/provider/discord';
import logger from '@/lib/logger/winstonLogger';
import { deleteAuthToken, isDiscordAuthRevokedError } from '@/lib/authorization/provider/util';
import * as Sentry from '@sentry/nextjs';
import UserMetrics, { IUserMetrics, Metric } from '@/lib/models/UserMetrics';
import { QuestBase } from './base';
import { sendBadgeCheckMessage, sendBadgeCheckMessages } from '@/lib/kafka/client';
import { ClientSession } from 'mongoose';

export class JoinDiscordServerQuest extends QuestBase {
  // 定义discord服务器id与指标的映射关系
  private readonly joinServerMetrics = new Map<string, Metric>([
    [process.env.MOONVEIL_DISCORD_SERVER_ID!, Metric.DiscordJoinedMoonveil],
  ]);

  // 用户的授权discord_id，在checkClaimable()时设置
  private user_discord_id = '';

  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 该任务需要校验用户持有指定的角色，要求用户必须存在有效的授权token
    const discord = await queryUserDiscordAuthorization(userId);
    if (!discord || !discord.token) {
      logger.debug(`user ${userId} require discord auth to verify quest ${this.quest.id}`);
      // 当前用户未绑定discord或者用户的授权token已经失效，需要用户重新绑定
      return { claimable: false, require_authorization: AuthorizationType.Discord };
    }
    this.user_discord_id = discord.discord_id;
    const questProp = this.quest.properties as JoinDiscordServer;
    // 检查用户是否加入对应服务器
    try {
      const discordRequest = discordOAuthProvider.createRequest(discord.token);
      const servers: any = await discordRequest.get(`https://discord.com/api/users/@me/guilds`);
      if (!servers || servers.length == 0) {
        logger.warn(`user ${this.user_discord_id} verify quest ${this.quest.id} but no discord servers found`);
        return { claimable: false };
      }
      // 遍历用户加入的server
      for (const server of servers) {
        if (server.id == questProp.guild_id) {
          logger.debug(`user ${userId} joined discord server ${questProp.guild_id}`);
          return { claimable: true };
        }
      }
    } catch (error) {
      if (isDiscordAuthRevokedError(error)) {
        logger.warn(`discord user ${discord.token.platform_id} auth token revoked`);
        await deleteAuthToken(discord.token);
        return { claimable: false, require_authorization: AuthorizationType.Discord };
      }
      console.error(error);
      Sentry.captureException(error);
    }
    return { claimable: false };
  }

  async addUserAchievement<T>(userId: string, verified: boolean, extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{})): Promise<void> {
    const updateMetric = this.checkUserMetric(userId);
    await super.addUserAchievement(userId, verified, updateMetric);
    await this.sendBadgeCheckMessage(userId);
  }

  private async sendBadgeCheckMessage(userId: string) {
    const questProp = this.quest.properties as JoinDiscordServer;
    const joinServerMetric = this.joinServerMetrics.get(questProp.guild_id);
    if (joinServerMetric) {
      await sendBadgeCheckMessages(userId, {
        [joinServerMetric]: 1,
        [Metric.DiscordConnected]: 1,
      });
    }
  }

  private checkUserMetric(userId: string): undefined | ((session: ClientSession) => Promise<void>) {
    const questProp = this.quest.properties as JoinDiscordServer;
    const joinServerMetric = this.joinServerMetrics.get(questProp.guild_id);
    let updateMetric = undefined;
    if (joinServerMetric) {
      updateMetric = async (session: any) => {
        await UserMetrics.updateOne(
          { user_id: userId },
          {
            $set: { 
              [joinServerMetric]: 1,
              [Metric.DiscordConnected]: 1,
            },
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

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return {
        verified: false,
        require_authorization: claimableResult.require_authorization,
        tip: claimableResult.require_authorization ? 'You should connect your Discord Account first.' : undefined,
      };
    }

    // 检查是否触发关注指标
    const updateMetric = this.checkUserMetric(userId);

    // 污染discord，确保同一个discord单任务只能获取一次奖励
    const taint = `${this.quest.id},${AuthorizationType.Discord},${this.user_discord_id}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, updateMetric);
    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The Discord Account has already claimed reward.',
      };
    }
    await this.sendBadgeCheckMessage(userId);
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ?  result.tip ? result.tip : `You have claimed ${rewardDelta} MB.` : result.tip ? result.tip : 'Server Internal Error',
    };
  }
}
