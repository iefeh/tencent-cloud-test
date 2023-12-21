import {IQuest} from "@/lib/models/Quest";
import {HoldDiscordRole, verifyQuestResult} from "@/lib/quests/types";
import {queryUserDiscordAuthorization} from "@/lib/quests/items/connectDiscord";
import {AuthorizationType} from "@/lib/authorization/types";
import {discordOAuthProvider} from "@/lib/authorization/provider/discord";

// 校验用户是否拥有discord角色
export async function verifyHoldDiscordRoleQuest(userId: string, quest: IQuest): Promise<verifyQuestResult> {
    const discord = await queryUserDiscordAuthorization(userId);
    if (!discord || !discord.token) {
        // 当前用户未绑定discord或者用户的授权token已经失效，需要用户重新绑定
        return {claimable: false, require_authorization: AuthorizationType.Discord};
    }
    const prop = quest.properties as HoldDiscordRole;
    // 检查用户是否拥有对应的角色
    const discordRequest = discordOAuthProvider.createRequest(discord.token);
    const data = await discordRequest.get(`https://discord.com/api/users/@me/guilds/${prop.guild_id}/member`);
    console.log(data);
    return {claimable: false, auth_token: !!discord ? discord.token : null};
}