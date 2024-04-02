import { Document, models, Schema } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

export enum BattlepassRewardType {
  Premium = 'premium',
  Standard = 'standard',
}

export type PassSeries = {
  reward_type: BattlepassRewardType;
  // 赛季等级达成条件
  task_line: number;
  // 奖励的MB数量
  reward_moon_beam: number;
  //徽章ID
  badge_id: string;
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
