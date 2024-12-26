import {Document, Schema, models, model} from 'mongoose'
import {WhitelistEntityType} from "@/lib/quests/types";
import connectToMongoDbDev from "@/lib/mongodb/client";

// TODO：用户钱包需要添加资产同步标识？后台根据标识同步用户的资产，下发徽章？
export interface IWhitelist extends Document {
    // 白名单id
    whitelist_id: string,
    // 当前白名单类型
    whitelist_entity_type: WhitelistEntityType,
    whitelist_entity_id: string,
    // 白名单奖励，用于给与每个人不同的奖励，
    // 比如白名单可以用于quest，可以给白名单中的用户发放梯度的MB奖励值
    reward?: WhitelistReward,
    // 创建时间毫秒时间戳
    created_time: number,
}

type WhitelistReward = {
    // 奖励的MB数
    moon_beams: number;
    // 奖励的token
    token: {
        amount: number;
        amount_formatted: string;
    };
    // 奖励的more
    more_amount: number;
}

const WhitelistSchema = new Schema<IWhitelist>({
    whitelist_id: {type: String, required: true},
    whitelist_entity_type: {type: String},
    whitelist_entity_id: {type: String},
    reward: Schema.Types.Mixed,
    created_time: {type: Number},
});

WhitelistSchema.index({whitelist_id: 1, whitelist_entity_type: 1, whitelist_entity_id: 1}, {unique: true});
WhitelistSchema.index({whitelist_entity_id: 1});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Whitelist = models.Whitelist || connection.model<IWhitelist>('Whitelist', WhitelistSchema, 'whitelists');
export default Whitelist;