import { Document, Schema, models, model } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

export enum UserMoreSnapshotClaimStatus {
  ELIGIBLE = 'eligible',
  CLAIMING = 'claiming',
  CLAIMED = 'claimed',
}

export interface IUserMoreSnapshot extends Document {
  // 用户id
  user_id: string;
  // 领取状态
  status?: UserMoreSnapshotClaimStatus;
  // 总计more
  total_more: number;
  // 用户在记录时持有的MB数
  moonbeam: number;
  // 用户MB兑换MORE的倍率
  moonbeam_booster: number;
  // 用户从MB可以兑换MORE的数量，在有汇率后才有此项记录
  moonbeam_to_more: number;
  // P2A任务可以直接领取的MORE数量
  p2a_more: number;
  // P2A任务可以直接领取的MORE数量
  nft_sbt_more: number;
  // token box信息 badge_id: value
  token_box_info: Map<string, number>;
  // 创建时间
  created_time: number;
  // 更新时间
  updated_time: number;
}

const UserMoreSnapshotSchema = new Schema<IUserMoreSnapshot>({
  user_id: { type: String },
  status: { type: String },
  total_more: { type: Number, default: 0 },
  moonbeam: { type: Number },
  moonbeam_booster: { type: Number },
  moonbeam_to_more: { type: Number },
  p2a_more: { type: Number },
  nft_sbt_more: { type: Number },
  token_box_info: { type: Map },
  created_time: { type: Number, required: true },
  updated_time: { type: Number, required: true },
});

UserMoreSnapshotSchema.index({ taints: 1 }, { unique: true });
UserMoreSnapshotSchema.index({ owner_address: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserMoreSnapshot =
  models.UserMoreSnapshot ||
  connection.model<IUserMoreSnapshot>('UserMoreSnapshot', UserMoreSnapshotSchema, 'user_more_snapshot');
export default UserMoreSnapshot;
