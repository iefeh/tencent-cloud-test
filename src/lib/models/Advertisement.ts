import {Document, Schema, models, model} from 'mongoose'

export interface IAdvertisement extends Document {
    // 广告id
    id: string;
    // 广告的图片地址
    image_url: string;
    // 点击广告后的跳转地址
    link_url: string;
    // 广告标题
    title: string;
    // 广告描述
    description: string;
    // 广告在轮播中的顺序，按升序排列
    order: number;
    // 广告是否正在展示
    active: boolean;
    // 广告开始展示的日期
    start_time: number;
    // 广告结束展示的日期
    end_time: number;
    // 创建时间毫秒时间戳
    created_time: number;
    // 删除时间毫秒时间戳
    deleted_time: number | null;
}

const AdvertisementSchema = new Schema<IAdvertisement>({
    id: {type: String, required: true},
    image_url: {type: String},
    link_url: {type: String},
    title: {type: String},
    description: {type: String},
    order: {type: Number},
    active: {type: Boolean},
    start_time: {type: Number},
    end_time: {type: Number},
    created_time: {type: Number},
    deleted_time: {type: Number, default: null},
});


// 使用既有模型或者新建模型
const Advertisement = models.Advertisement || model<IAdvertisement>('Advertisement', AdvertisementSchema, 'advertisements');
export default Advertisement;