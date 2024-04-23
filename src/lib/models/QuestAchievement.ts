import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

// 任务完成记录
export interface IQuestAchievement extends Document {
    // 用户达成的任务id
    quest_id: string,
    // 达成任务的用户id
    user_id: string,
    // 创建时间毫秒时间戳
    created_time: number,
    // 校验时间
    verified_time: number,
    // 任务的进度，用于记录特定任务的进度信息，如tweet_interaction任务的点赞、转推进度.
    progress: any,
}

export type TweetInteractionProgress = {
    // 点赞推文id
    liked_tweet_id: string,
    // 转推推文id
    retweeted_tweet_id: string,
    // 评论推文id
    commented_tweet_id: string,
};

const QuestAchievementSchema = new Schema<IQuestAchievement>({
    quest_id: {type: String, required: true},
    user_id: {type: String, required: true},
    created_time: {type: Number},
    verified_time: {type: Number},
    progress: {type: Schema.Types.Mixed},
});

QuestAchievementSchema.index({user_id: 1, quest_id: 1}, {unique: true});
QuestAchievementSchema.index({quest_id: 1});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const QuestAchievement = models.QuestAchievement || connection.model<IQuestAchievement>('QuestAchievement', QuestAchievementSchema, 'quest_achievements');
export default QuestAchievement;
