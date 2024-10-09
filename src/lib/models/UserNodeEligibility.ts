import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

export enum NodeSourceType {
  Quest = 'quest',
  LuckyDraw = 'luckydraw',
}

//用户节点资格
export interface IUserNodeEligibility extends Document {
  //用户ID
  user_id: string;
  //节点等级
  node_tier: string;
  //节点数量
  node_amount: number;
  //获得途径
  source_type: NodeSourceType;
  //途径id
  source_id: string;
  //创建时间
  created_time: number;
}

const UserNodeEligibilitySchema = new Schema<IUserNodeEligibility>({
  user_id: { type: String, required: true },
  node_tier: { type: String, required: true },
  node_amount: { type: Number, required: true },
  source_type: { type: String, required: true },
  source_id: { type: String, required: true },
  created_time: { type: Number },
});

//用户id
UserNodeEligibilitySchema.index({ user_id: 1, source_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserNodeEligibility =
  models.UserNodeEligibility ||
  connection.model<IUserNodeEligibility>('UserNodeEligibility', UserNodeEligibilitySchema, 'user_node_eligibility');

UserNodeEligibility.createIndexes();

export default UserNodeEligibility;