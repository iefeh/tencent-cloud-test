import User, {IUser} from "@/lib/models/User";
import {redis} from "@/lib/redis/client";
import {SteamGamePriceOverview} from "@/lib/models/SteamGame";
import logger from "@/lib/logger/winstonLogger";

export async function try2AddUser2MBLeaderboard(userId: string) {
    try {
        const user = await User.findOne({user_id: userId, deleted_time: null}, {moon_beam: 1, _id: -1});
        if (!user) {
            return;
        }
        if (user.moon_beam == undefined) {
            logger.warn(`user ${userId} moon beam should but not found.`);
            return;
        }
        redis.zadd("moon_beam_lb", user.moon_beam, userId);
    } catch (e) {
        console.error("try to add user to MB leaderboard:", e)
    }
}


export async function getMBLeaderboardTopUsers(userId: string): Promise<mbLeaderboard> {
    // 暂时只展示前3名的信息
    const topUsers = await redis.zrevrange("moon_beam_lb", 0, 9, 'WITHSCORES');
    if (!topUsers || topUsers.length == 0) {
        return {
            leaderboard: [],
            me: null,
        };
    }
    // 查询所有用户信息
    const userIds = [];
    if (userId) {
        userIds.push(userId);
    }
    for (let i = 0; i < topUsers.length; i += 2) {
        userIds.push(topUsers[i]);
    }
    const users = await User.find({user_id: {$in: userIds}, deleted_time: null}, {
        _id: 0,
        user_id: 1,
        username: 1,
        avatar_url: 1
    }).lean() as mbLeaderboardUser[];
    const userMap = new Map<String, mbLeaderboardUser>(users.map(user => [user.user_id, user]));
    // 构建排行榜
    const lb: mbLeaderboard = {
        leaderboard: [],
        me: null,
    }
    if (userId) {
        // 查询用户排名
        let userRank: number | null = await redis.zrevrank("moon_beam_lb", userId);
        if (userRank) {
            // 用户存在排名时，设置用户的排名信息
            userRank = Number(userRank) + 1;
            // 查询用户的mb值
            let userScore = await redis.zscore("moon_beam_lb", userId);
            const me = userMap.get(userId);
            if (me) {
                // me.rank = userRank;
                me.is_top50 = userRank <= 50;
                me.moon_beam = Number(userScore);
                lb.me = me;
            }
        }
    }
    // 设置排行榜信息
    for (let i = 0; i < topUsers.length; i += 2) {
        const currUser = userMap.get(topUsers[i]);
        if (!currUser) {
            logger.error(`mb leaderboard user ${topUsers[i]} should but not found`);
            continue;
        }
        currUser.rank = i / 2 + 1;
        currUser.moon_beam = Number(topUsers[i + 1]);
        lb.leaderboard.push(currUser);
    }
    return lb;
}

export type mbLeaderboardUser = {
    rank: number;
    user_id: string;
    username: string;
    avatar_url: string;
    moon_beam: number;
    is_top50: boolean;
}

export type mbLeaderboard = {
    leaderboard: mbLeaderboardUser[];
    me: mbLeaderboardUser | null;
}