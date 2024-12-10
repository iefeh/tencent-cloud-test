import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

export enum CallbackTaskType {
  // 是否获取到新手徽章
  FREYR_NOVICE_NOTCH = 'freyr_novice_notch',
  // 是否完成一局矿工小游戏
  FREYR_PLAY_MINER = 'freyr_play_miner',
}

export interface ICallbackTaskOverview extends Document {
  // 用户id
  user_id: string;
  // 任务类型标识
  task: string;
  // 是否完成任务
  completed: boolean;
  // 创建时间毫秒时间戳
  created_time: number;
  // 更新时间毫秒时间戳
  updated_time: number;
}

const CallbackTaskOverviewSchema = new Schema<ICallbackTaskOverview>({
  user_id: { type: String, required: true },
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
  created_time: { type: Number },
  updated_time: { type: Number },
});

CallbackTaskOverviewSchema.index({ user_id: 1, task: 1 }, { unique: true });

export async function upsertCallbackTaskOverview(userId: string, type: CallbackTaskType, completed: boolean) {
  // find CallbackTaskOverview record
  const callbackTaskOverview = await CallbackTaskOverview.findOne({
    user_id: userId,
    task: type,
  });

  if (!callbackTaskOverview || callbackTaskOverview.completed !== completed) {
    // upsert CallbackTaskOverview
    await CallbackTaskOverview.updateOne(
      {
        user_id: userId,
        task: type,
        completed: completed,
        updated_time: Date.now(),
      },
      {
        $setOnInsert: { created_time: Date.now() },
      },
      { upsert: true },
    );
  }
}

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const CallbackTaskOverview =
  models.CallbackTaskOverview ||
  connection.model<ICallbackTaskOverview>('CallbackTaskOverview', CallbackTaskOverviewSchema, 'callback_task_overview');
export default CallbackTaskOverview;
