import { Document, Schema, models, model } from 'mongoose'
import { GameTicketReward, NodeMultiplier, NodeReward, QuestRewardType, QuestType, TokenReward } from "@/lib/quests/types";
import connectToMongoDbDev from "@/lib/mongodb/client";


// 任务记录
export interface IQuest extends Document {
    // 任务id，每个任务拥有唯一id
    id: string,
    // 任务名称
    name: string,
    //长期任务的种类
    category: string,
    //任务标签
    tag: string,
    // 任务描述
    description: string,
    // 任务提醒
    tip: string,
    // 任务类型
    type: QuestType,
    // 任务属性，根据任务类型不同，属性不同
    properties: any,
    // 奖励设置
    reward: {
        // 奖励类型
        type: QuestRewardType,
        // 固定奖励时的任务奖励数量
        amount: number,
        // 格式化的奖励，用于定制化的展示任务奖励
        amount_formatted: string,
        // 当奖励类型为range时，任务关联的动态奖励ids，关联UserMetricReward
        // 注意，当任务类型为whitelist时，会检查range_reward_ids，最后尝试根据白名单的奖励进行下发.
        range_reward_ids: string[],
        // 徽章列表id，任务可能会奖励的徽章，这里只是为了展示用.
        badge_ids: string[],
        // 任务权重
        season_pass_progress: number,
        // token配置
        token_reward: TokenReward,
        // 游戏门票奖励配置
        game_ticket_reward?: GameTicketReward,
        // 直接下发型节点奖励
        distribute_node?: NodeReward,
        // 抽奖型节点奖励
        raffle_node?: NodeReward,
        // NFT倍数级NODE奖励
        node_multiplier?: NodeMultiplier
    },
    // 任务是否激活，不展示未激活
    active: boolean;
    // 任务排序，按升序排列
    order: number;
    // 任务开始的日期
    start_time: number;
    // 任务参与结束时间
    participant_end_time: number;
    // 任务结束的日期
    end_time: number;
    // 创建时间毫秒时间戳
    created_time: number,
    // 更新时间毫秒时间戳
    updated_time: number,
    // 删除时间
    deleted_time: number,
    // 指定用户数组,仅数组内用户可见
    visible_user_ids?: string[]
}

const QuestSchema = new Schema<IQuest>({
    id: { type: String, required: true },
    name: { type: String },
    category: { type: String },
    tag: { type: String },
    description: { type: String, default: null },
    tip: { type: String, default: null },
    type: { type: String },
    properties: Schema.Types.Mixed,
    reward: {
        type: { type: String },
        amount: { type: Number },
        amount_formatted: { type: String },
        range_reward_ids: [String],
        badge_ids: [String],
        season_pass_progress: { type: Number },
        token_reward: { type: Schema.Types.Mixed },
        game_ticket_reward: { type: Schema.Types.Mixed },
        distribute_node: { type: Schema.Types.Mixed },
        raffle_node: { type: Schema.Types.Mixed },
        node_multiplier: { type: Schema.Types.Mixed }
    },
    active: { type: Boolean, default: false },
    order: { type: Number },
    start_time: { type: Number },
    participant_end_time: { type: Number },
    end_time: { type: Number },
    created_time: { type: Number },
    updated_time: { type: Number },
    deleted_time: { type: Number },
    visible_user_ids: { type: [String] }
});
// 任务唯一索引
QuestSchema.index({ id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Quest = models.Quest || connection.model<IQuest>('Quest', QuestSchema, 'quests');
export default Quest;