import {Document, Schema, models, model} from 'mongoose'

// 数据库里steam game信息的完整性
export enum SteamGameFilter {
    // 包含游戏的基本信息
    Basic = "basic",
    // 包含游戏的价格信息
    PriceOverview = "price_overview",
}

export type SteamGamePriceOverview = {
    currency: string,
    initial: number,
    final: number,
    discount_percent: number,
    initial_formatted: string,
    final_formatted: string,
}

export interface ISteamGame extends Document {
    // 游戏id
    steam_appid: string,
    filter: SteamGameFilter,
    // 需要的年龄
    required_age: number,
    // 是否免费
    is_free: boolean,
    detailed_description: string,
    about_the_game: string,
    short_description: string,
    supported_languages: string,
    header_image: string,
    capsule_image: string,
    capsule_imagev5: string,
    website: string,
    pc_requirements: any,
    mac_requirements: any,
    linux_requirements: any,
    developers: any,
    publishers: any,
    price_overview: SteamGamePriceOverview,
    packages: any,
    package_groups: any,
    platforms: any,
    metacritic: any,
    categories: any,
    genres: any,
    release_date: any,
    support_info: any,
    background: any,
    background_raw: any,
    content_descriptors: any,
    // 创建时间毫秒时间戳
    created_time: number,
}

const priceOverviewSchema = new Schema({
    currency: {type: String},
    initial: {type: Number},
    final: {type: Number},
    discount_percent: {type: Number},
    initial_formatted: {type: String},
    final_formatted: {type: String},
});

const SteamGameSchema = new Schema<ISteamGame>({
    steam_appid: {type: String, required: true},
    filter: {type: String, required: true},
    required_age: {type: Number},
    is_free: {type: Boolean},
    detailed_description: {type: String},
    about_the_game: {type: String},
    short_description: {type: String},
    supported_languages: {type: String},
    header_image: {type: String},
    capsule_image: {type: String},
    capsule_imagev5: {type: String},
    website: {type: String},
    pc_requirements: {type: Schema.Types.Mixed},
    mac_requirements: {type: Schema.Types.Mixed},
    linux_requirements: {type: Schema.Types.Mixed},
    developers: {type: Schema.Types.Mixed},
    publishers: {type: Schema.Types.Mixed},
    price_overview: priceOverviewSchema,
    packages: {type: Schema.Types.Mixed},
    package_groups: {type: Schema.Types.Mixed},
    platforms: {type: Schema.Types.Mixed},
    metacritic: {type: Schema.Types.Mixed},
    categories: {type: Schema.Types.Mixed},
    genres: {type: Schema.Types.Mixed},
    release_date: {type: Schema.Types.Mixed},
    support_info: {type: Schema.Types.Mixed},
    background: {type: Schema.Types.Mixed},
    background_raw: {type: Schema.Types.Mixed},
    content_descriptors: {type: Schema.Types.Mixed},
    created_time: {type: Number}
});

SteamGameSchema.index({steam_appid: 1}, {unique: true});

// 使用既有模型或者新建模型
export default models.SteamGame || model<ISteamGame>('SteamGame', SteamGameSchema, 'steam_games');

// new SteamGame({
//     steam_appid: steamId,
//     // 需要的年龄
//     required_age: app.required_age,
//     // 是否免费
//     is_free: app.is_free,
//     detailed_description: app.detailed_description,
//     about_the_game: app.about_the_game,
//     short_description: app.short_description,
//     supported_languages: app.supported_languages,
//     header_image: app.header_image,
//     capsule_image: app.capsule_image,
//     capsule_imagev5: app.capsule_imagev5,
//     website: app.website,
//     pc_requirements: app.pc_requirements,
//     mac_requirements: app.mac_requirements,
//     linux_requirements: app.linux_requirements,
//     developers: app.developers,
//     publishers: app.publishers,
//     price_overview: {
//         currency: app.price_overview,
//         initial: app.initial,
//         final: app.final,
//         discount_percent: app.discount_percent,
//         initial_formatted: app.initial_formatted,
//         final_formatted: app.final_formatted,
//     },
//     packages: app.packages,
//     package_groups: app.package_groups,
//     platforms: app.platforms,
//     metacritic: app.metacritic,
//     categories: app.categories,
//     genres: app.genres,
//     release_date: app.release_date,
//     support_info: app.support_info,
//     background: app.background,
//     background_raw: app.background_raw,
//     content_descriptors: app.content_descriptors,
//     created_time: Date.now(),
// })