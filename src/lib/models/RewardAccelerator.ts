import {Document, Schema, models, model} from 'mongoose'
import {RewardAcceleratorType} from "@/lib/accelerator/types";


// 奖励加速器，用户完成特定事件(如活动或者任务)后，可以获得额外的MB奖励
export interface IRewardAccelerator extends Document {
    // 加速器Id
    id: string,
    type: RewardAcceleratorType,
    // 加速器名称
    name: string,
    // 加速器描述
    description: string,
    // 加速器图片地址
    image_url: string,
    // 加速器属性
    properties: any,
    // 创建时间，毫秒时间戳
    created_time: number,
}

const RewardAcceleratorSchema = new Schema<IRewardAccelerator>({
    id: {type: String, required: true},
    type: {type: String},
    name: {type: String},
    description: {type: String},
    image_url: {type: String},
    properties: Schema.Types.Mixed,
    created_time: {type: Number},
});

RewardAcceleratorSchema.index({id: 1}, {unique: true});

// 使用既有模型或者新建模型
const RewardAccelerator = models.RewardAccelerator || model<IRewardAccelerator>('RewardAccelerator', RewardAcceleratorSchema, 'reward_accelerators');
export default RewardAccelerator;
