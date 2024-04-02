import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';
//用户提醒
export interface INotificationReadFlag extends Document {
  //用户ID
  user_id: string;
  //上次读取时间
  notification_id: string;
  //创建时间
  created_time: number;
}

const NotificationReadFlagSchema = new Schema<INotificationReadFlag>({
  user_id: { type: String, required: true },
  notification_id: { type: String, required: true },
  created_time: { type: Number },
});

NotificationReadFlagSchema.index({ user_id: 1, notification_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const NotificationReadFlag =
  models.GlobalNotification ||
  connection.model<INotificationReadFlag>('NotificationReadFlag', NotificationReadFlagSchema, 'notification_read_flag');
export default NotificationReadFlag;
