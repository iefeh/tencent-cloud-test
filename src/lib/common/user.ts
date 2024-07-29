import connectToMongoDbDev from '@/lib/mongodb/client';
import User from '@/lib/models/User';
import logger from '@/lib/logger/winstonLogger';
import Whitelist, { IWhitelist } from '@/lib/models/Whitelist';

// 获取用户的首个白名单记录
export async function getUserFirstWhitelist(userId: string, whitelistId: string): Promise<IWhitelist | null> {
    const userAuth = await queryUserAuth(userId);
    // 根据 WhitelistEntityType 构建查询数组
    const entities = [userId];
    if (userAuth.wallet) {
        entities.push(userAuth.wallet);
    }
    if (userAuth.discord) {
        entities.push(userAuth.discord.id);
    }
    if (userAuth.twitter) {
        entities.push(userAuth.twitter.id);
    }
    if (userAuth.google) {
        entities.push(userAuth.google.id);
    }
    if (userAuth.steam) {
        entities.push(userAuth.steam.id);
    }
    if (userAuth.telegram) {
        entities.push(userAuth.telegram.id);
    }
    if (userAuth.email) {
        entities.push(userAuth.email);
    }
    // 检查用户的首个白名单记录
    return Whitelist.findOne({ whitelist_id: whitelistId, whitelist_entity_id: { $in: entities } });
}

// 检查用户的授权信息
export async function queryUserAuth(userId: string): Promise<any> {
    const aggregation = [
        { $match: { user_id: userId, deleted_time: null } },
        {
            $project: {
                _id: 0,
                user_id: 1,
                email: 1,
            },
        },
        {
            $lookup: {
                from: 'user_wallets',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'wallet',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            wallet_addr: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'user_googles',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'google',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            id: '$google_id',
                            email: '$email',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'user_twitters',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'twitter',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            id: '$twitter_id',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'user_discords',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'discord',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            id: '$discord_id',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'user_steams',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'steam',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            id: '$steam_id',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'user_telegrams',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'telegram',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            id: '$telegram_id',
                        },
                    },
                ],
            },
        },
    ];
    const results = await User.aggregate(aggregation);
    const userAuth = constructUserAuth(results);
    if (!userAuth) {
        logger.error(`user ${userId} not found from db`);
    }
    return userAuth;
}

export async function queryUser(userId: string): Promise<any> {
    const aggregation = [
        { $match: { user_id: userId, deleted_time: null } },
        {
            $lookup: {
                from: 'user_wallets',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'wallet',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            wallet_addr: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'user_googles',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'google',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            username: '$name',
                            avatar_url: '$picture',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'user_twitters',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'twitter',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            username: '$name',
                            avatar_url: '$profile_image_url',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'user_discords',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'discord',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            username: '$global_name',
                            avatar_url: '$avatar',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'user_steams',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'steam',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            username: '$personaname',
                            avatar_url: '$avatar',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'user_telegrams',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'telegram',
                pipeline: [
                    { $match: { deleted_time: null } },
                    {
                        $project: {
                            _id: 0,
                            username: '$username',
                            avatar_url: '$avatar',
                        },
                    },
                ],
            },
        },
        {
            $project: {
                _id: 0,
                __v: 0,
                deleted_time: 0,
            },
        },
    ];

    const results = await User.aggregate(aggregation);
    const userAuth = constructUserAuth(results);
    if (!userAuth) {
        logger.error(`user ${userId} not found from db`);
    }
    return userAuth;
}

function constructUserAuth(userAggResult: any): any {
    if (userAggResult.length > 0) {
        const user = userAggResult[0];
        user.wallet = user.wallet[0]?.wallet_addr || null;
        user.google = user.google[0] || null;
        user.twitter = user.twitter[0] || null;
        user.discord = user.discord[0] || null;
        user.steam = user.steam[0] || null;
        user.telegram = user.telegram[0] || null;
        return user;
    }
    return null;
}
