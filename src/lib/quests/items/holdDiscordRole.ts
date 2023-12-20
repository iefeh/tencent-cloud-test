import {IQuest} from "@/lib/models/Quest";
import {verifyQuestResult} from "@/lib/quests/types";
import {queryUserDiscordAuthorization} from "@/lib/quests/items/connectDiscord";
import {AuthorizationType} from "@/lib/authorization/types";

// 校验用户是否拥有discord角色
export async function verifyHoldDiscordRoleQuest(userId: string, quest: IQuest): Promise<verifyQuestResult> {
    const discord = await queryUserDiscordAuthorization(userId);
    if (!discord || !discord.token) {
        // 当前用户未绑定discord或者用户的授权token已经失效，需要用户重新绑定
        return {claimable: false, require_authorization: AuthorizationType.Discord};
    }

    return {claimable: !!discord, auth_token: !!discord ? discord.token : null};
}