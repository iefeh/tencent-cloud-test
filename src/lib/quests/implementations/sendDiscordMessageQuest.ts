import {IQuest} from "@/lib/models/Quest";
import {
    checkClaimableResult,
    SendDiscordMessage
} from "@/lib/quests/types";
import {ConnectDiscordQuest} from "@/lib/quests/implementations/connectDiscordQuest";
import {AuthorizationType} from "@/lib/authorization/types";
import logger from "@/lib/logger/winstonLogger";
import UserDiscord from "@/lib/models/UserDiscord";
import GuildChannelMessage from "@/lib/models/GuildChannelMessage";

export class SendDiscordMessageQuest extends ConnectDiscordQuest {

    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        // 此处只要用户绑定了discord账号就行，不强求授权token的有效性
        const discord = await UserDiscord.findOne({user_id: userId, deleted_time: null});
        if (!discord) {
            logger.debug(`user ${userId} require discord auth to verify quest ${this.quest.id}`);
            // 当前用户未绑定discord或者用户的授权token已经失效，需要用户重新绑定
            return {claimable: false, require_authorization: AuthorizationType.Discord};
        }
        this.user_discord_id = discord.discord_id;
        const questProp = this.quest.properties as SendDiscordMessage;
        // 检查用户是否完成发言
        const filter: any = {
            guild_id: questProp.guild_id,
            channel_id: questProp.channel_id,
            author_id: this.user_discord_id,
            deleted_time: null,
        };
        if (questProp.start_time) {
            filter["created_time"] = {$gte: questProp.start_time};
        }
        if (questProp.end_time) {
            if (filter["created_time"] === undefined) {
                filter["created_time"] = {};
            }
            filter["created_time"]["$lt"] = questProp.end_time;
        }
        if (questProp.min_msg_length) {
            filter["content_len"] = {$gte: questProp.min_msg_length};
        }
        const msg = await GuildChannelMessage.findOne(filter, {_id: 0, created_time: 1});
        return {claimable: !!msg};
    }
}