import { Document, models, PipelineStage, Schema } from 'mongoose'
import connectToMongoDbDev from '../mongodb/client'

export enum CDKRewardType {
  MoonBeam = 'moon_beam',
  Badge = 'badge'
}

export interface ICDKRedeemRecord extends Document {
  cdk: string,//CDK
  redeem_user_id: string,//兑换人
  redeem_taint: string[],//兑换污点
  redeem_time: number//兑换时间
}

const CDKRedeemRecordSchema = new Schema<ICDKRedeemRecord>({
  cdk: { type: String, required: true, unique: true },
  redeem_taint: { type: [String], required: true },
  redeem_user_id: { type: String, required: true },
  redeem_time: { type: Number },
});

CDKRedeemRecordSchema.index({ cdk: 1 })
CDKRedeemRecordSchema.index({ redeem_user: 1 })
CDKRedeemRecordSchema.index({ redeem_taint: 1 }, { unique: true })

const connection = connectToMongoDbDev();
const CDKRedeemRecord = models.CDKRedeemRecord || connection.model<ICDKRedeemRecord>('CDKRedeemRecord', CDKRedeemRecordSchema, 'cdk_redeem_record');
export default CDKRedeemRecord;