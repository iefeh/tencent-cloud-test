import { Document, Schema, models, model } from 'mongoose';
import { Metric } from '@/lib/models/UserMetrics';
import connectToMongoDbDev from '@/lib/mongodb/client';

export interface IVirtualKOLMetrics extends Document {
  user_id: string;
  invite_code: string;
  // 被邀请人数
  total_invitee: number;
  // 总计已经完成新手徽章Novice Notch的被邀请人数
  total_novice_badge_invitee: number;

  // 总计非直接被邀请的人数
  total_indirect_invitee: number;
  // 总计已经完成新手徽章Novice Notch的非直接被邀请人数
  total_indirect_novice_badge_invitee: number;

  // 总计已校验钱包资产的被邀请人数
  total_wallet_verified_invitee: number;
  // 被邀请人总计钱包token价值
  total_invitee_wallet_token_usd_value: number;
  // 被邀请人总计钱包NFT价值
  total_invitee_wallet_nft_usd_value: number;
  // 被邀请人总计钱包资产价值 = 钱包token价值+WalletNFTUSDValue
  total_invitee_wallet_asset_usd_value: number;
  // 创建时间毫秒时间戳
  created_time: number;
}

const VirtualKOLMetricsSchema = new Schema<IVirtualKOLMetrics>({
  user_id: { type: String, required: true },
  invite_code: { type: String, required: true },
  total_invitee: { Type: Number },
  total_novice_badge_invitee: { Type: Number },
  total_indirect_invitee: { Type: Number },
  total_indirect_novice_badge_invitee: { Type: Number },
  total_wallet_verified_invitee: { Type: Number },
  total_invitee_wallet_token_usd_value: { Type: Number },
  total_invitee_wallet_nft_usd_value: { Type: Number },
  total_invitee_wallet_asset_usd_value: { Type: Number },
  created_time: { type: Number },
});

VirtualKOLMetricsSchema.index({ user_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const VirtualKOLMetrics =
  models.VirtualKOLMetrics ||
  connection.model<IVirtualKOLMetrics>('VirtualKOLMetrics', VirtualKOLMetricsSchema, 'virtual_kol_metrics');

export default VirtualKOLMetrics;

// 设置用户的指标
export async function createVirtualKOLMetric(userId: string, metric: Metric, value: string | number) {
  const result = VirtualKOLMetrics.updateOne(
    { user_id: userId },
    {
      $set: { [metric]: value },
      $setOnInsert: { created_time: Date.now() },
    },
    { upsert: true },
  );

  return result;
}

export async function createVirtualKOLMetrics(userId: string, metrics: { [key: string]: string | number | boolean }) {
  let setOperations: { [key: string]: string | number | boolean } = {};
  for (const [metric, value] of Object.entries(metrics)) {
    setOperations[metric] = value;
  }
  const result = VirtualKOLMetrics.updateOne(
    { user_id: userId },
    {
      $set: setOperations,
      $setOnInsert: { created_time: Date.now() },
    },
    { upsert: true },
  );

  return result;
}

export async function incrVirtualKOLMetric(userId: string, metric: Metric, incrValue: number, session: any) {
  await VirtualKOLMetrics.updateOne(
    { user_id: userId },
    {
      $inc: { [metric]: incrValue },
      $setOnInsert: {
        created_time: Date.now(),
      },
    },
    { upsert: true, session: session },
  );
}

export async function incrVirtualKOLMetrics(
  userId: string,
  metrics: { [key: string]: string | number | boolean },
  session: any,
) {
  let incOps: any = {};
  for (const [metric, value] of Object.entries(metrics)) {
    incOps[metric] = value;
  }
  await VirtualKOLMetrics.updateOne(
    { user_id: userId },
    {
      $inc: incOps,
      $setOnInsert: {
        created_time: Date.now(),
      },
    },
    { upsert: true, session: session },
  );
}
