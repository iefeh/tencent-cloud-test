import { Document, models, PipelineStage, Schema } from 'mongoose'
import connectToMongoDbDev from '../mongodb/client'

export enum CDKRewardType {
  MoonBeam = 'moon_beam',
  Badge = 'badge',
  LotteryTicket = 'lottery_ticket',
  PremiumPass = 'premium_pass',
  GameTicket = 'game_ticket'
}

export interface ICDK extends Document {
  id: string,//CDK id
  template_id: string,//CDK模板ID
  cdk: string,//CDK显示内容
  created_time: number,//创建时间
  expired_time: number,//过期时间
  max_redeem_count: number,//最大可领取数量，值为0或无效值则表示无领取上限
  current_redeem_count: number,//当前领取数量
}

const CDKSchema = new Schema<ICDK>({
  id: { type: String, required: true, unique: true },
  template_id: { type: String, required: true },
  cdk: { type: String, required: true },
  created_time: { type: Number },
  expired_time: { type: Number },
  max_redeem_count: { type: Number },
  current_redeem_count: { type: Number, default: 0 },
});

CDKSchema.index({ id: 1 }, { unique: true })
CDKSchema.index({ cdk: 1 }, { unique: true })

const connection = connectToMongoDbDev();
const CDK = models.CDK || connection.model<ICDK>('CDK', CDKSchema, 'cdk');
export default CDK;

//查询CDK信息
export async function getCDKInfo(cdk: string, userId: string): Promise<any> {

  const pipeline: PipelineStage[] = [{
    $match: {
      cdk: cdk
    }
  }, {
    $lookup: {
      from: 'cdk_redeem_record',
      let: { cdk: '$cdk' },
      as: "redeem_record",
      pipeline: [{
        $match: { $expr: { $and: [{ $eq: ['$cdk', '$$cdk'] }, { $eq: ['$redeem_user_id', userId] }] } }
      }, {
        $project: { _id: 0, redeem_user_id: 1 }
      }]
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
      id: 0,
      _id: 0,
      __v: 0,
      template_id: 0,
      created_time: 0,
      'template._id': 0,
      'template.__v': 0,
      'template.channel_id': 0,
      'template.created_time': 0,
      'channel._id': 0,
      'channel.name': 0,
      'channel.prefix': 0,
      'channel.remark': 0,
      'channel.created_time': 0,
      'channel.updated_time': 0,
      'channel.__v': 0,
    }
  }];

  const result = await CDK.aggregate(pipeline);
  return result[0];
}