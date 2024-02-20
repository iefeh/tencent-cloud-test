import {IQuest} from "@/lib/models/Quest";
import { checkClaimableResult, JoinDiscordServer} from "@/lib/quests/types";
import {ConnectDiscordQuest, queryUserDiscordAuthorization} from "@/lib/quests/implementations/connectDiscordQuest";
import {AuthorizationType} from "@/lib/authorization/types";
import {discordOAuthProvider} from "@/lib/authorization/provider/discord";
import logger from "@/lib/logger/winstonLogger";
import {deleteAuthToken, isDiscordAuthRevokedError} from "@/lib/authorization/provider/util";
import * as Sentry from "@sentry/nextjs";

export class JoinDiscordServerQuest extends ConnectDiscordQuest {

    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        // 该任务需要校验用户持有指定的角色，要求用户必须存在有效的授权token
        const discord = await queryUserDiscordAuthorization(userId);
        if (!discord || !discord.token) {
            logger.debug(`user ${userId} require discord auth to verify quest ${this.quest.id}`);
            // 当前用户未绑定discord或者用户的授权token已经失效，需要用户重新绑定
            return {claimable: false, require_authorization: AuthorizationType.Discord};
        }
        this.user_discord_id = discord.discord_id;
        const questProp = this.quest.properties as JoinDiscordServer;
        // 检查用户是否加入对应服务器
        try {
            const discordRequest = discordOAuthProvider.createRequest(discord.token);
            const servers: any = await discordRequest.get(`https://discord.com/api/users/@me/guilds`);
            if (!servers || servers.length == 0) {
                logger.warn(`user ${this.user_discord_id} verify quest ${this.quest.id} but no discord servers found`);
                return {claimable: false};
            }
            // 遍历用户加入的server
            for (const server of servers) {
                if (server.id == questProp.guild_id) {
                    logger.debug(`user ${userId} joined discord server ${questProp.guild_id}`);
                    return {claimable: true}
                }
            }
        } catch (error) {
            if (isDiscordAuthRevokedError(error)) {
                logger.warn(`discord user ${discord.token.platform_id} auth token revoked`);
                await deleteAuthToken(discord.token);
                return {claimable: false, require_authorization: AuthorizationType.Discord};
            }
            console.error(error);
            Sentry.captureException(error);
        }
        return {claimable: false}
    }
}