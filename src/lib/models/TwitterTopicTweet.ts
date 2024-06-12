import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface ITwitterTopicTweet extends Document {
    // 推文id
    id: string,
    // 推文作者id
    author_id: string,
    // 记录创建时间，毫秒时间戳
    created_at: number,
    // 推文内容
    text: string,
    // 话题id，关联至集合twitter_topics
    topic_id: string,
    // 推文发布时间，毫秒时间戳
    tweeted_at: number,
}

const TwitterTopicTweetSchema = new Schema<ITwitterTopicTweet>({
    id: { type: String},
    author_id: { type: String},
    created_at: { type: Number},
    text: { type: String},
    topic_id: { type: String},
    tweeted_at: { type: Number},
});

TwitterTopicTweetSchema.index({topic_id: 1});
TwitterTopicTweetSchema.index({author_id: 1});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const TwitterTopicTweet = models.TwitterTopicTweet || connection.model<ITwitterTopicTweet>('TwitterTopicTweet', TwitterTopicTweetSchema, 'twitter_topic_tweets');
export default TwitterTopicTweet;