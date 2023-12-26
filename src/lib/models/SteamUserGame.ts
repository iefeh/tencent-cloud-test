import {Document, Schema, models, model} from 'mongoose'

export type SteamUserGameStats = {
    // 游戏id
    app_id: string,
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
    // 用户的steam id
    steam_id: string,
    // 游戏数量
    game_count: number,
    // 用户的游戏
    games: SteamUserGameStats[],
    // 创建时间毫秒时间戳
    created_time: number,
    // 更新时间毫秒时间戳
    updated_time: number | null,
}

const SteamUserGameSchema = new Schema<ISteamUserGame>({
    steam_id: {type: String, required: true},
    game_count: {type: Number, required: true},
    games: {type: Schema.Types.Mixed, required: true},
    created_time: {type: Number},
    updated_time: {type: Number},
});

SteamUserGameSchema.index({steam_id: 1}, {unique: true});

// 使用既有模型或者新建模型
export default models.SteamUserGame || model<ISteamUserGame>('SteamUserGame', SteamUserGameSchema, 'steam_user_games');
