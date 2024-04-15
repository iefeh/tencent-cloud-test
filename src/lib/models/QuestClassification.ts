import { Document, Schema, models, model } from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export enum ClassificationType {
  Category = 'category',
  Tag = 'tag'
}
// 任务分类
export interface IQuestClassification extends Document {
  //分种类ID
  id: string,
  //类型
  type: ClassificationType,
  //分类名称
  name: string,
  //种类展示顺序
  order: number
  // 创建时间毫秒时间戳
  created_time: number,
}

const QuestClassificationSchema = new Schema<IQuestClassification>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  order: { type: Number },
  created_time: { type: Number },
});

QuestClassificationSchema.index({ id: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const QuestClassification = models.QuestClassification || connection.model<IQuestClassification>('QuestClassification', QuestClassificationSchema, 'quest_classifications');
export default QuestClassification;
