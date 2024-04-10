import { Document, models, PipelineStage, Schema } from 'mongoose'
import connectToMongoDbDev from '../mongodb/client'
import { pipe } from 'gsap';

export interface ICDK extends Document {
  id: string,//CDK id
  template_id: string,//CDK模板ID
  cdk: string,//CDK显示内容
  created_time: number,//创建时间
  redeem_taints: string[],//兑换污点
  redeem_user_id: string,//兑换USER_ID
  redeem_time: number//兑换时间
}

const CDKSchema = new Schema<ICDK>({
  id: { type: String, required: true, unique: true },
  template_id: { type: String, required: true },
  cdk: { type: String, required: true },
  created_time: { type: Number },
  redeem_taints: { type: [String] },
  redeem_user_id: { type: String },
  redeem_time: { type: Number }
});

CDKSchema.index({ id: 1 }, { unique: true })
CDKSchema.index({ cdk: 1 }, { unique: true })
CDKSchema.index({ redeem_taints: 1 }, { unique: true })

const connection = connectToMongoDbDev();
const CDK = models.CDK || connection.model<ICDK>('CDK', CDKSchema, 'cdk');
export default CDK;

//查询CDK信息
export async function getCDKInfos(cdk: string): Promise<any[]> {
  console.log(cdk);
  const pipeline: PipelineStage[] = [{
    $match: {
      cdk: cdk
    }
  }, {
    $lookup: {
      from: 'cdk_template',
      let: { id: '$template_id' },
      as: "template",
      pipeline: [{
        $match: { $expr: { $and: [{ $eq: ['$id', '$$id'] }] } }
      }]
    }
  }, {
    $unwind: '$template'
  }, {
    $lookup: {
      from: 'cdk_channel',
      let: { id: '$template.channel_id' },
      as: "channel",
      pipeline: [{
        $match: { $expr: { $and: [{ $eq: ['$id', '$$id'] }] } }
      }]
    }
  }, {
    $unwind: '$channel'
  }, {
    $project: {
      _id: 0,
    }
  }];


  const result = await CDK.aggregate(pipeline);
  console.log(result);
  return result;
}