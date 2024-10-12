import { Document, models, Schema } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

//用户高阶通证获得类型
export enum LotteryPoolRequirementType {
  NFT = 'nft',
  Node = 'node',
  Badge = 'badge',
  Moonbeam = 'moon_beam',
  WhiteList = 'whitelist'
}

export type NFTRequirement = {
  contract_addr: string;
  name: string;
}

export type BadgeRequirement = {
  badge_id: string;
  name: string;
  lvl: number;
}

export type MBRequirementment = {
  mb_amount: number;
}

export type WhitelistRequirement = {
  whitelist_id: string;
  whitelist_entity_type: string;
  image_url: string;
}

export interface ILotteryPoolRequirement extends Document {
  id: string,
  lottery_pool_id: string,
  type: LotteryPoolRequirementType,
  description: string,
  properties: any[]
}

const LotteryPoolRequirementSchema = new Schema<ILotteryPoolRequirement>({
  id: { type: String, required: true },
  lottery_pool_id: { type: String, required: true },
  type: { type: String },
  description: { type: String },
  properties: { type: Schema.Types.Mixed }
});

LotteryPoolRequirementSchema.index({ id: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const LotteryPoolRequirements =
  models.LotteryPoolRequirements ||
  connection.model<ILotteryPoolRequirement>('LotteryPoolRequirements', LotteryPoolRequirementSchema, 'lottery_pool_requirements');
export default LotteryPoolRequirements;
