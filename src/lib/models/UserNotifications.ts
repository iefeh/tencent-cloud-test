import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';
import { v4 as uuidV4 } from 'uuid';
//用户提醒
export interface IUserNotification extends Document {
  //用户ID
  user_id: string;
  //通知ID
  notification_id: string;
  //提醒内容
  content: string;
  //提醒中的链接
  link: string;
  //创建时间
  created_time: number;
}

const UserNotificationSchema = new Schema<IUserNotification>({
  user_id: { type: String, required: true },
  notification_id: { type: String, required: true },
  content: { type: String, required: true },
  link: { type: String },
  created_time: { type: Number },
});

//用户id
UserNotificationSchema.index({ user_id: 1, notification_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserNotifications =
  models.UserNotification ||
  connection.model<IUserNotification>('UserNotifications', UserNotificationSchema, 'user_notifications');
export default UserNotifications;

// 保存用户通知.
export async function createUserNotification(userId: string, content: string, link: string | null = null, session?: any): Promise<void> {
  const ntfn = new UserNotifications({
    user_id: userId,
    notification_id: uuidV4(),
    content: content,
    link: link,
    created_time: Date.now(),
  });
  if (session) {
    await ntfn.save({ session });
  } else {
    await ntfn.save();
  }
}