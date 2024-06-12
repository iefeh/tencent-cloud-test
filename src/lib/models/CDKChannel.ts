import { Document, models, Schema } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

//cdk渠道
export interface ICDKChannel extends Document {
  id: string,//渠道ID
  name: string,//渠道名称
  repeat_claimable: boolean,//是否可以重复领取
  prefix: string,//渠道前辍，主要是渠道相关信息
  remark: string,//备注
  created_time: number,//时间戳
  updated_time: number//时间戳
}

const CDKChannelSchema = new Schema<ICDKChannel>({
  id: { type: String, rquired: true, unique: true },
  name: { type: String },
  repeat_claimable: { type: Boolean, default: true },
  prefix: { type: String },
  remark: { type: String },
  created_time: { type: Number },
  updated_time: { type: Number }
});

CDKChannelSchema.index({ id: 1 }, { unique: true });

const connection = connectToMongoDbDev();
const CDKChannel = models.CDKChannel || connection.model<ICDKChannel>('CDKChannel', CDKChannelSchema, 'cdk_channel');
export default CDKChannel;