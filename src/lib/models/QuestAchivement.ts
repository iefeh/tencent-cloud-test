import {Document, Schema, models, model} from 'mongoose'

// 任务完成记录
export interface IQuestAchievement extends Document {
    // 用户达成的任务id
    quest_id: string,
    // 达成任务的用户id
    user_id: string,
    // 任务完成的污点，对应创建唯一键，用以限制用户是否可以多次完成同一个任务
    taint: string,
    // 创建时间毫秒时间戳
    created_time: number,
}

const QuestAchievementSchema = new Schema<IQuestAchievement>({
    quest_id: {type: String, required: true},
    user_id: {type: String, required: true},
    taint: {type: String},
    created_time: {type: Number},
});

QuestAchievementSchema.index({quest_id: 1, user_id: 1});
QuestAchievementSchema.index({user_id: 1, quest_id: 1});
QuestAchievementSchema.index({taint: 1}, {unique: true});

// 使用既有模型或者新建模型
export default models.QuestAchievement || model<IQuestAchievement>('QuestAchievement', QuestAchievementSchema, 'quest_achievements');