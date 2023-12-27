import {Document, Schema, models, model} from 'mongoose'
import {Metric} from "@/lib/models/UserMetrics";

// 指标奖励类型
export enum UserMetricRewardType {
    // 奖励MB
    MoonBeams = "moon_beams",
    // 奖励徽章
    Badges = "badges",
}

// 用户指标的范围奖励
export interface IUserMetricReward extends Document {
    // 奖励id
    id: string,
    // 奖励类型
    reward_type: UserMetricRewardType;
    // 奖励依赖的用户指标
    require_metric: Metric,
    // 操作符
    require_operator: '==' | '>=' | '<=' | '>' | '<';
    // 奖励配置
    settings: RewardItem[],
    // 创建时间毫秒时间戳
    created_time: number,
}

export type RewardItem = {
    // 指标必须满足的值
    require_metric_value: boolean | number | string;
    // 奖励的MB数量
    reward_moon_beam?: number;
    // 奖励的对应徽章
    reward_badge_id?: string;
    // 奖励的徽章等级
    reward_badge_level?: number;
}

const rewardItemSchema = new Schema({
    require_metric_value: {type: Schema.Types.Mixed, required: true},
    reward_moon_beam: {type: Number},
    reward_badge_id: {type: String},
    reward_badge_level: {type: Number},
});

const UserMetricRewardSchema = new Schema<IUserMetricReward>({
    id: {type: String, required: true},
    reward_type: {type: String, required: true},
    require_metric: {type: String, required: true},
    require_operator: {type: String, enum: ['==', '>=', '<=', '>', '<'], required: true},
    settings: [rewardItemSchema],
    created_time: {type: Number, required: true}
});

UserMetricRewardSchema.index({id: 1}, {unique: true});
UserMetricRewardSchema.index({require_metric: 1, reward_type: 1});

// 使用既有模型或者新建模型
export default models.UserMetricReward || model<IUserMetricReward>('UserMetricReward', UserMetricRewardSchema, 'user_metric_rewards');

// 检查用户指标满足的奖励设置
export function checkMetricReward(metricValue: boolean | number | string, reward: IUserMetricReward): RewardItem | null {
    const compareValues = (a: RewardItem, b: RewardItem, operator: string) => {
        switch (operator) {
            case '>=':
            case '>':
                // 当操作符是 '>=' 或 '>' 时，我们想要'大'的值在前面，因此使用倒序排序。
                // 如果a的值大于b的值，则返回负数（a排在前面）
                return Number(b.require_metric_value) - Number(a.require_metric_value);

            case '<=':
            case '<':
                // 当操作符是 '<=' 或 '<' 时，我们想要'小'的值在前面，因此使用正序排序。
                // 如果a的值小于b的值，则返回负数（a排在前面）
                return Number(a.require_metric_value) - Number(b.require_metric_value);
            default:
                return 0;
        }
    };
    // 对奖励设置进行排序，确保排序和操作符匹配，以用于和用户指标进行比较，定位奖励
    reward.settings.sort((a, b) => compareValues(a, b, reward.require_operator));
    for (const setting of reward.settings) {
        let isEligibleForReward = false;
        switch (reward.require_operator) {
            case '==':
                isEligibleForReward = metricValue == setting.require_metric_value;
                break;
            case '>=':
                isEligibleForReward = metricValue >= setting.require_metric_value;
                break;
            case '<=':
                isEligibleForReward = metricValue <= setting.require_metric_value;
                break;
            case '>':
                isEligibleForReward = metricValue > setting.require_metric_value;
                break;
            case '<':
                isEligibleForReward = metricValue < setting.require_metric_value;
                break;
        }
        if (isEligibleForReward) {
            return setting;
        }
    }
    return null;
}