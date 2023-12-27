import {IQuest} from "@/lib/models/Quest";
import {HoldDiscordRole, checkClaimableResult} from "@/lib/quests/types";
import {queryUserDiscordAuthorization} from "@/lib/quests/implementations/connectDiscord";
import {AuthorizationType} from "@/lib/authorization/types";
import {discordOAuthProvider} from "@/lib/authorization/provider/discord";
import logger from "@/lib/logger/winstonLogger";
import {deleteAuthToken, isDiscordAuthRevokedError} from "@/lib/authorization/provider/util";

// 校验用户是否拥有discord角色
export async function verifyHoldDiscordRoleQuest(userId: string, quest: IQuest): Promise<checkClaimableResult> {
    const discord = await queryUserDiscordAuthorization(userId);
    if (!discord || !discord.token) {
        logger.debug(`user ${userId} require discord auth to verify quest ${quest.id}`);
        // 当前用户未绑定discord或者用户的授权token已经失效，需要用户重新绑定
        return {claimable: false, require_authorization: AuthorizationType.Discord};
    }
    const questProp = quest.properties as HoldDiscordRole;
    // 检查用户是否拥有对应的角色
    try {
        const discordRequest = discordOAuthProvider.createRequest(discord.token);
        const data: any = await discordRequest.get(`https://discord.com/api/users/@me/guilds/${questProp.guild_id}/member`);
        console.log(data);
        const roles = data.roles;
        if (!roles || roles.length == 0) {
            return {claimable: false};
        }
        const rolesMap = new Map(questProp.role_ids.map(id => [id, true]));
        for (const role of roles) {
            if (rolesMap.has(role)) {
                return {claimable: true}
            }
        }
    } catch (error) {
        if (isDiscordAuthRevokedError(error)) {
            logger.warn(`discord user ${discord.token.platform_id} auth token revoked`);
            await deleteAuthToken(discord.token);
            return {claimable: false, require_authorization: AuthorizationType.Discord};
        }
        throw error;
    }

    return {claimable: false};
}