import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface ITwitterTopic extends Document {
    // 话题id
    id: string,
    // 话题的关键词
    hash_tags: string[],
    // 话题需要提到的用户
    mention_usernames: string[],
    // 回复的推文id
    reply_to_tweet_id: string,
    // 话题的开始结束时间，毫秒时间戳
    start_time: number,
    end_time: number,
    // 验证推文的延迟秒数，用于避免推文被删除
    delay_seconds: number,
    // 是否包含转发
    retweet_excluded: boolean,
    // 是否包含回复, 设置为true时会导致原始推文不能被查询到.
    reply_excluded: boolean,
    // 是否包含引用
    quote_excluded: boolean,
    // 话题是否已同步完成
    synced: boolean,
    // 话题是否激活
    active: boolean,
}

const TwitterTopicSchema = new Schema<ITwitterTopic>({
    id: { type: String},
    hash_tags: { type: [String]},
    mention_usernames: { type: [String]},
    reply_to_tweet_id: { type: String},
    start_time: { type: Number},
    end_time: { type: Number},
    delay_seconds: { type: Number},
    retweet_excluded: { type: Boolean},
    reply_excluded: { type: Boolean},
    quote_excluded: { type: Boolean},
    synced: { type: Boolean},
    active: { type: Boolean},
});

TwitterTopicSchema.index({id: 1}, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const TwitterTopic = models.TwitterTopic || connection.model<ITwitterTopic>('TwitterTopic', TwitterTopicSchema, 'twitter_topics');
export default TwitterTopic;