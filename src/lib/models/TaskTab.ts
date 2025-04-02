import { Document, Schema, models } from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

// Tab
export interface ITaskTab extends Document {
  // Tab名称
  name: string;
  // TabICON
  icon: string;
  // Tab对应的任务种类
  task_category: string;
  // Tab是否激活，不展示未激活
  active: boolean;
  // Tab排序，按升序排列
  order: number;
  // Tab开始的日期
  start_time: number;
  // Tab结束的日期
  end_time: number;
}

const TaskTabSchema = new Schema<ITaskTab>({
  name: { type: String },
  icon: { type: String },
  task_category: { type: String },
  active: { type: Boolean, default: false },
  order: { type: Number },
  start_time: { type: Number },
  end_time: { type: Number }
});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const TaskTab = models.TaskTab || connection.model<ITaskTab>('TaskTab', TaskTabSchema, 'task_tabs');
export default TaskTab;