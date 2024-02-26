import {Document, models, Schema} from "mongoose";
import connectToMongoDbDev from "@/lib/mongodb/client";
import {Metric} from "@/lib/models/UserMetrics";

export interface IBadges extends Document {
    // 徽章id，每个徽章拥有唯一id
    id: string,
    // 徽章名称
    name: string,
    // 徽章描述
    description: string,
    // 徽章系列，存放徽章的等级与其对应信息
    series: Map<string, BadgeSeries>,
    // 徽章获取地址
    obtain_url: string,
    // 支持的链id
    chain_id: string,
    // 创建时间毫秒时间戳
    created_time: number,
    // 更新时间毫秒时间戳
    updated_time: number,
    // 删除时间毫秒时间戳
    deleted_time: number | null,
}

export type BadgeSeries = {
    // 系列描述
    description: string;
    // 系列图片
    icon_url: string;
    image_url: string;
    // 系列达成条件
    requirements: Requirement[];
    // 是否开放mint，当开放mint时，会在用户claim徽章后，生成用户徽章的mint记录.
    open_for_mint: boolean;
}

// 要求类型
export enum RequirementType {
    // 用户指标
    UserMetric = "user_metric",
    // 白名单
    Whitelist = "whitelist",
}

export type Requirement = {
    // 必须满足的条件类型，可以为白名单、指标等
    type: RequirementType;
    // 必须满足的条件属性，根据type不同，属性不同
    properties: any;
}

type WhitelistRequirement = {
    // 白名单id
    whitelist_id: string;
}

export type UserMetricRequirement = {
    metric: Metric;
    operator: '==' | '>=' | '<=' | '>' | '<';
    value: boolean | number | string;
    // 奖励的MB数量
    reward_moon_beam: number,
}

const BadgesSchema = new Schema<IBadges>({
    id: {type: String, required: true},
    name: {type: String},
    description: {type: String},
    series: {type: Map},
    obtain_url: {type: String},
    chain_id: {type: String},
    created_time: {type: Number},
    updated_time: {type: Number},
    deleted_time: {type: Number, default: null},
});

BadgesSchema.index({id: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Badges = models.Badges || connection.model<IBadges>('Badges', BadgesSchema, 'badges');
export default Badges;