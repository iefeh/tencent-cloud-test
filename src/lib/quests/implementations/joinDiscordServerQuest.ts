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
import { sendBadgeCheckMessage } from '@/lib/kafka/client';

export class JoinDiscordServerQuest extends QuestBase {
  // 定义discord服务器id与指标的映射关系
  private readonly followMetrics = new Map<string, Metric>([
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
    const questProp = this.quest.properties as JoinDiscordServer;
    const followMetric = this.followMetrics.get(questProp.guild_id);
    let updateMetric = undefined;
    if (followMetric) {
      updateMetric = async (session: any) => {
        await UserMetrics.updateOne(
          { user_id: userId },
          {
            $set: { [followMetric]: true },
            $setOnInsert: {
              created_time: Date.now(),
            },
          },
          { upsert: true, session: session },
        );
      };
    }

    // 污染discord，确保同一个discord单任务只能获取一次奖励
    const taint = `${this.quest.id},${AuthorizationType.Discord},${this.user_discord_id}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, updateMetric);
    let userMetric: IUserMetrics = await UserMetrics.find({ user_id: userId });
    if (
      userMetric.twitter_connected &&
      userMetric.twitter_followed_astrark &&
      userMetric.twitter_followed_moonveil &&
      userMetric.discord_connected &&
      userMetric.discord_joined_moonveil
    ) {
      await UserMetrics.updateOne(
        { user_id: userId },
        {
          $set: { [Metric.NoviceNotch]: 1 },
          $setOnInsert: {
            created_time: Date.now(),
          },
        },
        { upsert: true },
      );
      sendBadgeCheckMessage(userId, Metric.NoviceNotch);
    }

    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The Discord Account has already claimed reward.',
      };
    }
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ? `You have claimed ${rewardDelta} MB.` : 'Server Internal Error',
    };
  }
}
