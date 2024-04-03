import { Document, models, Schema } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';
//用户高阶通证获得类型
export enum BattlePassRequirementType {
  NFT = 'nft',
  Badge = 'badge'
}

export interface IBattlepassPremiumRequirement extends Document {
  id: string,
  season_id: number,
  type: BattlePassRequirementType,
  description: string,
  properties: any[]
}

const BattlepassPremiumRequirementSchema = new Schema<IBattlepassPremiumRequirement>({
  id: { type: String, required: true },
  season_id: { type: Number, required: true },
  type: { type: String },
  description: { type: String },
  properties: { type: Schema.Types.Mixed }
});

BattlepassPremiumRequirementSchema.index({ id: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const BattlePassPremiumRequirements =
  models.BattlePassPremiumRequirements ||
  connection.model<IBattlepassPremiumRequirement>('BattlePassPremiumRequirements', BattlepassPremiumRequirementSchema, 'battle_pass_premium_requirements');
export default BattlePassPremiumRequirements;
