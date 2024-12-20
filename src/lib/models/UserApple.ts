import { Document, Schema, models, model } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

export interface IUserApple extends Document {
  // 苹果用户的关联id
  user_id: string;
  // 用户的苹果id
  apple_id: string;
  username: string;
  first_name: string;
  last_name: string;
  // 创建时间毫秒时间戳
  created_time: number;
  // 删除时间毫秒时间戳
  deleted_time: number | null;
}

const UserAppleSchema = new Schema<IUserApple>({
  user_id: { type: String, required: true },
  apple_id: { type: String, required: true },
  username: { type: String, required: true },
  first_name: { type: String, required: false },
  last_name: { type: String, required: false },
  created_time: { type: Number, required: true },
  deleted_time: { type: Number, default: null },
});
// 用户唯一索引，同一个用户不允许绑定多个同类账号
UserAppleSchema.index({ user_id: 1, deleted_time: 1 }, { unique: true });
// 苹果唯一索引，同一个账号不允许多绑定
UserAppleSchema.index({ apple_id: 1, deleted_time: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserApple = models.UserApple || connection.model<IUserApple>('UserApple', UserAppleSchema, 'user_apples');
export default UserApple;
