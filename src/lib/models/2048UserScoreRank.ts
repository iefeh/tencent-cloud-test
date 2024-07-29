import { Document, Model, model, models, Schema } from 'mongoose';
import { connectToMongoDb2048 } from '../mongodb/client';

// 2048排行榜信息
export interface IUserScoreRank extends Document {
    // 关联的用户id
    uid: string;
    // 排行榜id
    leaderboard_id: string;
    // 排行榜总积分
    sum_score: number;
}

const UserScoreRankSchema = new Schema<IUserScoreRank>({
    uid: { type: String, required: true },
    leaderboard_id: { type: String },
    sum_score: { type: Number },
});

const connection = connectToMongoDb2048();
const UserScoreRank: Model<IUserScoreRank> = models.userBackpack || connection.model<IUserScoreRank>("UserScoreRank", UserScoreRankSchema, 'user_score_rank');
export default UserScoreRank;