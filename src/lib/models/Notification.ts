import { Document, Schema, models } from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";
//提醒类型
export enum NotificationType {
   Instant = 'instant',//即时消息
   Timeout = 'timeout',//定时消息
}
//提醒范围
export enum NotificationRange {
   All = 'all',//提醒所有用户
   Participated = 'participated',//提醒参加了特定活动的用户
}

//提醒
export interface INotification extends Document {
   //提醒id
   id: string,
   //目标ID，徽章ID、活动ID或者任务ID
   target_id: string,
   //提醒内容
   content: string,
   //提醒中的链接
   link: string,
   //提醒类型
   type: NotificationType,
   //提醒范围
   range: NotificationRange,
   //特定用户数据来源
   participants: string[],
   //结束前多久提醒，毫秒时间戳
   timeout: number,
   //活动结束时间，毫秒时间戳
   end_time: number,
   //创建时间，毫秒时间戳
   created_time: number,
}

const NotificationSchema = new Schema<INotification>({
   id: { type: String, required: true },
   content: { type: String },
   link: { type: String },
   type: { type: String },
   range: { type: String },
   participants: { type: [String] },
   timeout: { type: Number },
   end_time: { type: Number },
   created_time: { type: Number },
});


// 提醒唯一id
NotificationSchema.index({ id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Notification = models.Notification || connection.model<INotification>('Notification', NotificationSchema, 'notifications');
export default Notification;