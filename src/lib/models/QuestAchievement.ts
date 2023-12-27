import {Document, Schema, models, model} from 'mongoose'

// 任务完成记录
export interface IQuestAchievement extends Document {
    // 用户达成的任务id
    quest_id: string,
    // 达成任务的用户id
    user_id: string,
    // 创建时间毫秒时间戳
    created_time: number,
}

const QuestAchievementSchema = new Schema<IQuestAchievement>({
    quest_id: {type: String, required: true},
    user_id: {type: String, required: true},
    created_time: {type: Number},
});

QuestAchievementSchema.index({quest_id: 1, user_id: 1}, {unique: true});
QuestAchievementSchema.index({user_id: 1});

// 使用既有模型或者新建模型
export default models.QuestAchievement || model<IQuestAchievement>('QuestAchievement', QuestAchievementSchema, 'quest_achievements');
