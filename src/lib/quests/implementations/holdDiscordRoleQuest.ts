import {IQuest} from "@/lib/models/Quest";
import {HoldDiscordRole, checkClaimableResult} from "@/lib/quests/types";
import {ConnectDiscordQuest, queryUserDiscordAuthorization} from "@/lib/quests/implementations/connectDiscordQuest";
import {AuthorizationType} from "@/lib/authorization/types";
import {discordOAuthProvider} from "@/lib/authorization/provider/discord";
import logger from "@/lib/logger/winstonLogger";
import {deleteAuthToken, isDiscordAuthRevokedError} from "@/lib/authorization/provider/util";
import * as Sentry from "@sentry/nextjs";

export class HoldDiscordRoleQuest extends ConnectDiscordQuest {

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
        const questProp = this.quest.properties as HoldDiscordRole;
        // 检查用户是否拥有对应的角色
        try {
            const discordRequest = discordOAuthProvider.createRequest(discord.token);
            const data: any = await discordRequest.get(`https://discord.com/api/users/@me/guilds/${questProp.guild_id}/member`);
            const roles = data.roles;
            if (!roles || roles.length == 0) {
                logger.warn(`quest ${this.quest.id} discord roles not present`);
                return {claimable: false, tip:"Please get the correct role in Discord first, then verify again."};
            }
            const rolesMap = new Map(questProp.role_ids.map(id => [id, true]));
            // 目前暂时要求满足设置的全部角色
            let ownedRoles = 0;
            for (const role of roles) {
                if (rolesMap.has(role)) {
                    ownedRoles++;
                }
            }
            const claimable = ownedRoles == questProp.role_ids.length;
            return {claimable, tip: claimable ? undefined : "Please get the correct role in Discord first, then verify again."};
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