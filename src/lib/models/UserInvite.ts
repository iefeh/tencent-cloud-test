import { Document, Schema, models, model } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

export interface IUserInvite extends Document {
  // 邀请人id
  user_id: string;
  // 被邀请人id
  invitee_id: string;
  // 邀请人是虚拟用户
  virtual?: boolean;
  // 创建时间毫秒时间戳
  created_time: number;
}

const UserInviteSchema = new Schema<IUserInvite>({
  user_id: { type: String, required: true },
  invitee_id: { type: String, required: true },
  virtual: { type: Boolean, default: false },
  created_time: { type: Number, required: true },
});

UserInviteSchema.index({ invitee_id: 1 }, { unique: true });
UserInviteSchema.index({ user_id: 1, invitee_id: 1 });
// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserInvite = models.UserInvite || connection.model<IUserInvite>('UserInvite', UserInviteSchema, 'user_invites');
export default UserInvite;

