import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export type SteamUserGameStats = {
    // 游戏id
    appid: string,
    // 玩耍时长，分钟.
    playtime_forever: number,
    playtime_2weeks: number,
    img_icon_url: string,
    playtime_windows_forever: number,
    playtime_mac_forever: number,
    playtime_linux_forever: number,
    rtime_last_played: number,
}

export interface ISteamUserGame extends Document {
    // 快照id，用于关联用户获取的奖励
    id: string,
    // 添加该信息的用户
    user_id: string,
    // 用户的steam id
    steam_id: string,
    // 游戏数量
    game_count: number,
    // 用户的游戏
    games: SteamUserGameStats[],
    // 创建时间毫秒时间戳
    created_time: number,
}

const SteamUserGameSchema = new Schema<ISteamUserGame>({
    id: {type: String, required: true},
    user_id: {type: String, required: true},
    steam_id: {type: String, required: true},
    game_count: {type: Number, required: true},
    games: {type: Schema.Types.Mixed, required: true},
    created_time: {type: Number},
});

SteamUserGameSchema.index({id: 1}, {unique: true});
SteamUserGameSchema.index({user_id: 1, steam_id: 1});
SteamUserGameSchema.index({steam_id: 1, user_id: 1});

// 使用既有模型或者新建模型
const connection = await connectToMongoDbDev();
const SteamUserGame = models.SteamUserGame || connection.model<ISteamUserGame>('SteamUserGame', SteamUserGameSchema, 'steam_user_games');
export default SteamUserGame;
