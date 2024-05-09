import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

export interface IUserLotteryPool extends Document {
  // 用户id
  user_id: string;
  // 用户在本奖池的抽奖次数
  draw_amount: number;
  // 奖池id
  lottery_pool_id: string;
  // 用户twitter话题id
  twitter_topic_id: string;
  // 用户拥有的奖池抽奖券数量
  free_lottery_ticket_amount: number;
}

const UserLotteryPoolSchema = new Schema<IUserLotteryPool>({
  user_id: { type: String },
  draw_amount: { type: Number, default: 0 },
  lottery_pool_id: { type: String },
  twitter_topic_id: { type: String },
  free_lottery_ticket_amount: { type: Number, default: 0 }
});

// 用户奖池记录
UserLotteryPoolSchema.index({ user_id: 1, lottery_pool_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserLotteryPool = models.UserLotteryPool || connection.model<IUserLotteryPool>('UserLotteryPool', UserLotteryPoolSchema, 'user_lottery_pool');
export default UserLotteryPool;
