import { Document, Model, model, models, Schema } from 'mongoose';
import { connectToMongoDbGoldminer } from '../mongodb/client';

// 2048排行榜配置信息
export interface IScoreLeaderboardConfig extends Document {
    lbid: string;
    start_time: number;
    end_time: number;
}

const ScoreLeaderboardConfigSchema = new Schema<IScoreLeaderboardConfig>({
    lbid: { type: String, required: true },
    start_time: { type: Number, required: true },
    end_time: { type: Number, required: true }
});

const connection = connectToMongoDbGoldminer();
const GoldminerScoreLeaderboardConfig: Model<IScoreLeaderboardConfig> = models.ScoreLeaderboardConfig || connection.model<IScoreLeaderboardConfig>("ScoreLeaderboardConfig", ScoreLeaderboardConfigSchema, 'score_leaderboard_config');
export default GoldminerScoreLeaderboardConfig;

