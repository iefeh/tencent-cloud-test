import { Document, models, Schema } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

type Reward = {
  reward_moon_beam: number;
  badge_id: string;
};

export type PassSeries = {
  // 赛季等级达成条件
  requirements: Requirement[];
  // 奖励的MB数量
  reward: Reward;
  //等级图标
  image_url?: string;
};

export type Requirement = {
  // 必须满足的条件类型，可以为白名单、指标等
  type: RequirementType;
  // 必须满足的条件属性，根据type不同，属性不同
  properties: any;
};

export enum RequirementType {
  // 用户指标
  Metric = 'metric',
}

//前置条件
export type Precondition = {
  mandatory: boolean; //是否必须完成
  metric: string; //指标名称
};

//前置条件配置
export type PreconditionConfig = {
  optional_tasks_require: number; //可选必须完成数量
  preconditions: Precondition[]; //所有任务ID
};

export interface IBattlePassSeasons extends Document {
  //赛季ID
  id: number;
  //标准通证定义
  standard_pass: Map<string, PassSeries>;
  //高阶通证定义
  premium_pass: Map<string, PassSeries>;
  //赛季开始时间
  start_time: number;
  //赛季结束时间
  end_time: number;
  //创建时间
  created_time: number;
}

const BattlePassSeasonSchema = new Schema<IBattlePassSeasons>({
  id: { type: Number, unique: true, required: true },
  standard_pass: { type: Map, required: true },
  premium_pass: { type: Map, required: true },
  start_time: { type: Number, required: true },
  end_time: { type: Number, required: true },
  created_time: { type: Number, required: true },
});

BattlePassSeasonSchema.index({ id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const BattlePassSeasons =
  models.BattlePassSeasons ||
  connection.model<IBattlePassSeasons>('BattlePassSeasons', BattlePassSeasonSchema, 'battle_pass_seasons');
export default BattlePassSeasons;

export async function getCurrentSeasonId(): Promise<number> {
  const now: number = Date.now();
  const current_season = await BattlePassSeasons.findOne({ start_time: { $lte: now }, end_time: { $gte: now } });
  return current_season ? current_season.id : undefined;
}
