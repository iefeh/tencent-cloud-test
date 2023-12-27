import {IQuest} from "@/lib/models/Quest";
import {HoldDiscordRole, checkClaimableResult, claimRewardResult} from "@/lib/quests/types";
import {queryUserDiscordAuthorization} from "@/lib/quests/implementations/connectDiscordQuest";
import {AuthorizationType} from "@/lib/authorization/types";
import {discordOAuthProvider} from "@/lib/authorization/provider/discord";
import logger from "@/lib/logger/winstonLogger";
import {deleteAuthToken, isDiscordAuthRevokedError} from "@/lib/authorization/provider/util";
import {QuestBase} from "@/lib/quests/implementations/base";
import UserDiscord from "@/lib/models/UserDiscord";
import OAuthToken, {IOAuthToken} from "@/lib/models/OAuthToken";

export class HoldDiscordRoleQuest extends QuestBase {
    // 用户的授权discord_id，在checkClaimable()时设置
    private user_discord_id = "";

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
                return {claimable: false};
            }
            const rolesMap = new Map(questProp.role_ids.map(id => [id, true]));
            // 目前暂时要求满足设置的全部角色
            let ownedRoles = 0;
            for (const role of roles) {
                if (rolesMap.has(role)) {
                    ownedRoles++;
                }
            }
            return {claimable: ownedRoles == questProp.role_ids.length};
        } catch (error) {
            if (isDiscordAuthRevokedError(error)) {
                logger.warn(`discord user ${discord.token.platform_id} auth token revoked`);
                await deleteAuthToken(discord.token);
                return {claimable: false, require_authorization: AuthorizationType.Discord};
            }
            console.error(error);
        }
        return {claimable: false}
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        const claimableResult = await this.checkClaimable(userId);
        if (!claimableResult.claimable) {
            return {
                verified: false,
                require_authorization: claimableResult.require_authorization,
                tip: claimableResult.require_authorization ? "You should connect your Discord Account first." : undefined,
            }
        }
        // 污染discord，确保同一个discord单任务只能获取一次奖励
        const taint = `${this.quest.id},${AuthorizationType.Discord},${this.user_discord_id}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        const result = await this.saveUserReward(userId, taint, rewardDelta);
        if (result.duplicated) {
            return {
                verified: false,
                tip: "The Discord Account has already claimed reward.",
            }
        }
        return {verified: result.done, claimed_amount: result.done ? rewardDelta : undefined}
    }
}


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