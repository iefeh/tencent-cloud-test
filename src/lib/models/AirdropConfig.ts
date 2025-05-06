import { Document, models, Schema } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';
import { Metric } from '@/lib/models/UserMetrics';

export enum AirdropStage {
  P2A = 'p2a',
  AFTER_P2A = 'after_p2a',
  CLAIM = 'claim',
  COOLDOWN = 'cooldown',
}

// Airdrop config在数据库中应该只有唯一一条记录
export interface IAirdropConfigs extends Document {
  // 配置id
  id: string;
  // 空投的链
  chain_id: string;
  // 阶段信息
  stages: Map<string, AirdropStageConfig>;
  // 是否已经创建快照
  snapshot_created: boolean;
  // MB汇率
  moonbeam_exchange_rate: number;
  // token box信息 badge_id: value
  token_box_config: Map<string, number>;
  // 有资格的最低MB数量
  min_eligible_moonbeam: number;
  // Novice notch badge id
  novice_notch_badge_id: string;
  // S1 Standard Thruster badge id
  s1_standard_thruster_badge_id: string;
  // S1 Premium Thruster badge id
  s1_premium_thruster_badge_id: string;
  // MB Lv1 兑换倍率
  moonbeam_lv1_booster: number;
  // MB Lv2 兑换倍率
  moonbeam_lv2_booster: number;
  // MB Lv3 兑换倍率
  moonbeam_lv3_booster: number;
  // MB Lv4 兑换倍率
  moonbeam_lv4_booster: number;
  // MB LV1 需求持有徽章数
  moonbeam_lv1_badge_req: number;
  // MB LV2 需求持有徽章数
  moonbeam_lv2_badge_req: number;
}

export type AirdropStageConfig = {
  stage_name: AirdropStage; // 阶段名称
  start_time: number; // 开始时间（毫秒时间戳）
  end_time: number; // 结束时间（毫秒时间戳）
};

const AirdropConfigsSchema = new Schema<IAirdropConfigs>({
  id: { type: String, required: true },
  chain_id: { type: String, required: true },
  stages: { type: Map },
  snapshot_created: { type: Boolean, default: false },
  moonbeam_exchange_rate: { type: Number, default: null },
  token_box_config: { type: Map },
  min_eligible_moonbeam: { type: Number, required: true },
  novice_notch_badge_id: { type: String, required: true },
  s1_standard_thruster_badge_id: { type: String, required: true },
  s1_premium_thruster_badge_id: { type: String, required: true },
  moonbeam_lv1_booster: { type: Number, required: true },
  moonbeam_lv2_booster: { type: Number, required: true },
  moonbeam_lv3_booster: { type: Number, required: true },
  moonbeam_lv4_booster: { type: Number, required: true },
  moonbeam_lv1_badge_req: { type: Number, required: true },
  moonbeam_lv2_badge_req: { type: Number, required: true },
});

AirdropConfigsSchema.index({ id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const AirdropConfigs =
  models.AirdropConfigs || connection.model<IAirdropConfigs>('AirdropConfigs', AirdropConfigsSchema, 'airdrop_configs');
export default AirdropConfigs;
