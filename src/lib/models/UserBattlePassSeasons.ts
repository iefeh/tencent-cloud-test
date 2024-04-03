import { Document, models, Schema } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';
import { BattlePassRequirementType } from './BattlepassPremiumRequirements';

export enum BattlePassType {
  PremiumPass = 'premium_pass',
  StandardPass = 'standard_pass',
}
//用户达成的奖励
type Reward = {
  satisfied_time: number;
  expired_time?: number;//通过过期时间确保用户没法取得升级为高阶通证之前的奖励。
  claimed_time?: number;
};

type RewardRecords = {
  standard: Map<String, Reward>;
  premium: Map<String, Reward>;
}

export interface IUserBattlePassSeasons extends Document {
  user_id: string; //用户ID
  battlepass_season_id: number; //赛季ID
  is_premium: boolean;//是否高阶
  premium_type: BattlePassRequirementType//高阶通证类型，主要是徽章、NFT。
  finished_tasks: number; //完成任务数
  max_lv: number; //赛季最大等级
  reward_records: RewardRecords; //奖励记录，记录用户各等级达成时间和领取时间
  total_moon_beam: number; //该赛季获得的MB数
  created_time: number; //创建时间
  updated_time: number; //修改时间
}

const UserBattlePassSeasonsSchema = new Schema({
  user_id: { type: String, required: true },
  battlepass_season_id: { type: Number, required: true },
  is_premium: { type: Boolean },
  premium_type: { type: String },
  finished_tasks: { type: Number },
  max_lv: { type: Number },
  reward_records: { type: Map },
  total_moon_beam: { type: Number },
  created_time: { type: Number },
  updated_time: { type: Number },
});

UserBattlePassSeasonsSchema.index({ user_id: 1, battlepass_season_id: 1 }, { unique: true });

const connection = connectToMongoDbDev();
const UserBattlePassSeasons =
  models.UserBattlePassSeasons ||
  connection.model<IUserBattlePassSeasons>(
    'UserBattlePassSeasons',
    UserBattlePassSeasonsSchema,
    'user_battlepass_seasons',
  );
export default UserBattlePassSeasons;
