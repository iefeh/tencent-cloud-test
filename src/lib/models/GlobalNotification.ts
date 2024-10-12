import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';
//用户提醒
export interface IGlobalNotification extends Document {
  //通知ID
  notification_id: string;
  //提醒内容
  content: string;
  //提醒中的链接
  link: string;
  //创建时间
  created_time: number;
  //是否为通知模板
  template_notification?: boolean;
}

const GlobalNotificationSchema = new Schema<IGlobalNotification>({
  notification_id: { type: String, required: true },
  content: { type: String, required: true },
  link: { type: String },
  created_time: { type: Number },
  template_notification: { type: Boolean, required: false },
});

GlobalNotificationSchema.index({ notification_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const GlobalNotification =
  models.GlobalNotification ||
  connection.model<IGlobalNotification>('GlobalNotifications', GlobalNotificationSchema, 'global_notifications');
export default GlobalNotification;
