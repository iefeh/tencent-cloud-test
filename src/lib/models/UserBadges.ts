import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

export interface IUserBadges extends Document {
  // 用户id
  user_id: string;
  // 徽章id
  badge_id: string;
  //徽章污点，确保唯一下发
  badge_taints: string[];
  // 用户获取的徽章系列
  series: Map<string, UserBadgeSeries>;
  // 是否展示中
  display: boolean;
  // 创建时间毫秒时间戳
  created_time: number;
  // 更新时间毫秒时间戳
  updated_time: number;
  // 展示顺序
  order: number;
  //佩戴顺序
  display_order: number;
}

export type UserBadgeSeries = {
  // 获取时间，毫秒时间戳
  obtained_time: number;
  // 领取时间，毫秒时间戳
  claimed_time: number;
  // 徽章对应的mint记录id
  mint_id?: string;
};

const UserBadgesSchema = new Schema<IUserBadges>({
  user_id: { type: String, required: true },
  badge_id: { type: String },
  badge_taints: { type: [String] },
  series: { type: Map },
  display: { type: Boolean, default: false },
  created_time: { type: Number },
  updated_time: { type: Number },
  order: { type: Number },
  display_order: { type: Number },
});

UserBadgesSchema.index({ user_id: 1, badge_id: 1 }, { unique: true });
UserBadgesSchema.index({ badge_id: 1, user_id: 1 });
UserBadgesSchema.index({ badge_taints: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserBadges = models.UserBadges || connection.model<IUserBadges>('UserBadges', UserBadgesSchema, 'user_badges');
export default UserBadges;
