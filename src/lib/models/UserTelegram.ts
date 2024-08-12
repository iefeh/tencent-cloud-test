import { Document, Schema, models, model } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

export enum TelegramProfileVisibility {
  Invisible = 1,
  Visible = 3,
}

// 用户的telegram绑定
export interface IUserTelegram extends Document {
  user_id: string;
  telegram_id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  // 创建时间毫秒时间戳
  created_time: number;
  // 删除时间毫秒时间戳
  deleted_time: number | null;
}

const UserTelegramSchema = new Schema<IUserTelegram>({
  user_id: { type: String, required: true },
  telegram_id: { type: String, required: true },
  username: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  avatar: { type: String },
  created_time: { type: Number },
  deleted_time: { type: Number, default: null },
});

// 同一个用户不允许绑定多个telegram
UserTelegramSchema.index({ user_id: 1, deleted_time: 1 }, { unique: true });
// 同一个telegram不允许多绑定
UserTelegramSchema.index({ telegram_id: 1, deleted_time: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserTelegram =
  models.UserTelegram || connection.model<IUserTelegram>('UserTelegram', UserTelegramSchema, 'user_telegrams');
export default UserTelegram;
