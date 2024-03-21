import { Document, Schema, models } from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";
//用户提醒
export interface IUserNotification {
  //用户ID
  user_id: string,
  //提醒ID
  notification_id: string,
  //已读
  readed: boolean,
  //创建时间
  created_time: number,
  //修改时间
  updated_time: number,
}

const UserNotificationSchema = new Schema<IUserNotification>({
  user_id: { type: String, required: true },
  notification_id: { type: String, required: true },
  readed: { type: Boolean, default: false },
  created_time: { type: Number },
  updated_time: { type: Number },
});
//用户和提醒唯一ID
UserNotificationSchema.index({ user_id: 1, notification_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserNotification = models.UserNotification || connection.model<IUserNotification>('UserNotification', UserNotificationSchema, 'user_notifications');
export default UserNotification;