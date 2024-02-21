import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export enum SteamProfileVisibility {
    Invisible = 1,
    Visible = 3,
}

// 用户的steam绑定
export interface IUserSteam extends Document {
    user_id: string,
    steam_id: string,
    // 判断用户是否公开profile信息，communityvisibilitystate == 1表示不可见，communityvisibilitystate == 3表示可见
    communityvisibilitystate: SteamProfileVisibility,
    profilestate: number,
    personaname: string,
    commentpermission: string,
    profileurl: string,
    avatar: string,
    avatarmedium: string,
    avatarfull: string,
    avatarhash: string,
    personastate: number,
    realname: string,
    primaryclanid: string,
    timecreated: number,
    personastateflags: number,
    loccountrycode: string,
    // 创建时间毫秒时间戳
    created_time: number,
    // 删除时间毫秒时间戳
    deleted_time: number | null,
}

const UserSteamSchema = new Schema<IUserSteam>({
    user_id: {type: String, required: true},
    steam_id: {type: String, required: true},
    communityvisibilitystate: {type: Number},
    profilestate: {type: Number},
    personaname: {type: String},
    commentpermission: {type: String},
    profileurl: {type: String},
    avatar: {type: String},
    avatarmedium: {type: String},
    avatarfull: {type: String},
    avatarhash: {type: String},
    personastate: {type: Number},
    realname: {type: String},
    primaryclanid: {type: String},
    timecreated: {type: Number},
    personastateflags: {type: Number},
    loccountrycode: {type: String},
    created_time: {type: Number},
    deleted_time: {type: Number, default: null},
});

// 同一个用户不允许绑定多个steam
UserSteamSchema.index({user_id: 1, deleted_time: 1}, {unique: true});
// 同一个steam不允许多绑定
UserSteamSchema.index({steam_id: 1, deleted_time: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserSteam = models.UserSteam || connection.model<IUserSteam>('UserSteam', UserSteamSchema, 'user_steams');
export default UserSteam;
