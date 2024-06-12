import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from '../mongodb/client';

//cdk模板
export interface ICDKTemplate extends Document {
  id: string,//模板ID
  channel_id: string,//渠道ID
  description: string,//模板描述
  rewards: any[],//奖励
  active: boolean,//是否上线
  created_time: number
}

const CDKTemplateSchema = new Schema<ICDKTemplate>({
  id: { type: String, required: true, unique: true },
  channel_id: { type: String },
  description: { type: String },
  rewards: { type: [Object] },
  active: { type: Boolean, default: false },
  created_time: { type: Number }
});

CDKTemplateSchema.index({ id: 1 }, { unique: true })
CDKTemplateSchema.index({ id: 1, channel_id: 1 }, { unique: true })

const connection = connectToMongoDbDev()
const CDKTemplate = models.CDKTemplate || connection.model<ICDKTemplate>('CDKTemplate', CDKTemplateSchema, 'cdk_template');
export default CDKTemplate;