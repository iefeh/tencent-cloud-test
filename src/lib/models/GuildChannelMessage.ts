import {Document, Schema, models, model} from 'mongoose'
import {connectToMongoDbDiscord} from "@/lib/mongodb/client";

export interface IGuildChannelMessage extends Document {
    // 工会id
    guild_id: string,
    // 频道id
    channel_id: string,
    // 消息作者id
    author_id: string,
    // 消息id
    message_id: string,
    // 消息内容
    content: string,
    // 消息内容长度
    content_len: number,
    // 消息图片
    images: string[],
    // 创建时间毫秒时间戳
    created_time: number,
    // 更新时间毫秒时间戳
    updated_time: number,
    // 删除时间毫秒时间戳
    deleted_time: number | null,
}

const GuildChannelMessageSchema = new Schema<IGuildChannelMessage>({
    guild_id: {type: String},
    channel_id: {type: String},
    author_id: {type: String},
    message_id: {type: String},
    content: {type: String},
    content_len: {type: Number},
    images: {type: [String]},
    created_time: {type: Number},
    updated_time: {type: Number},
    deleted_time: {type: Number, default: null},
});

// 消息唯一
GuildChannelMessageSchema.index({guild_id: 1, channel_id: 1, message_id: 1}, {unique: true});
GuildChannelMessageSchema.index({channel_id: 1, message_id: 1});
GuildChannelMessageSchema.index({message_id: 1});
GuildChannelMessageSchema.index({author_id: 1});

// 特定数据库的模型
const connection = await connectToMongoDbDiscord();
const GuildChannelMessage = models.GuildChannelMessage || connection.model('GuildChannelMessage', GuildChannelMessageSchema, 'guild_channel_messages');
export default GuildChannelMessage;