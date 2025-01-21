import { Document, Model, model, models, PipelineStage, Schema } from 'mongoose';
import { connectToMongoDbBubblepop } from '../mongodb/client';
import User from './User';

// 2048排行榜信息
export interface IUserScoreRank extends Document {
    // 关联的用户id
    uid: string;
    // 排行榜id
    leaderboard_id: string;
    // 排行榜总积分
    sum_score: number;
    // 删除时间
    deleted_time: number;
}

const UserScoreRankSchema = new Schema<IUserScoreRank>({
    uid: { type: String, required: true },
    leaderboard_id: { type: String },
    sum_score: { type: Number },
    deleted_time: { type: Number },
});

const connection = connectToMongoDbBubblepop();
const BubblepopUserScoreRank: Model<IUserScoreRank> = models.UserScoreRank || connection.model<IUserScoreRank>("UserScoreRank", UserScoreRankSchema, 'user_score_rank');
export default BubblepopUserScoreRank;


export async function getBubblepopLeaderboard(userId: string | undefined, lbId: string) {
    // 查询排行榜信息
    const pipeline: PipelineStage[] = [
        {
            $match: { leaderboard_id: lbId, deleted_time: null }
        },
        {
            $project: { _id: 0, __v: 0, leaderboard_id: 0 }
        },
        {
            $sort: { sum_score: -1 }
        },
        {
            $limit: 20
        }];

    let lbInfos: any[] = await BubblepopUserScoreRank.aggregate(pipeline);
    let userIds = lbInfos.map(r => r.uid);

    // 查询用户昵称信息
    const infos: any[] = await User.find({ user_id: { $in: userIds } }, { user_id: 1, username: 1, avatar_url: 1, _id: 0 });
    const userIdInfoMap: Map<string, any> = new Map<string, any>(infos.map(info => [info.user_id, info]));
    let rank: number = 0;
    for (let lb of lbInfos) {
        const u = userIdInfoMap.get(lb.uid);
        if (!u) {
            continue;
        }
        lb.rank = ++rank;
        lb.player = u.username;
        lb.avatar = u.avatar_url;
        lb.score = lb.sum_score;
        delete lb.sum_score;
        delete lb.uid;
    }
    // 查询用户排行信息
    let userRank: any = '-';
    if (userId) {
        const userRankInfo = await BubblepopUserScoreRank.findOne({ leaderboard_id: lbId, uid: userId });
        if (userRankInfo) {
            userRank = await BubblepopUserScoreRank.count({ leaderboard_id: lbId, sum_score: { $gt: userRankInfo.sum_score } });
            userRank++;
        }
    }

    return { lbInfos: lbInfos, userRank: userRank };
}