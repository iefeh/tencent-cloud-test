import getMongoConnection from "@/lib/mongodb/client";
import User from "@/lib/models/User";
import logger from "@/lib/logger/winstonLogger";

export async function checkUserConnectionCount(userId: string): Promise<number> {
    const user = await queryUser(userId);
    let connection = 0;
    if (user.email) {
        connection++;
    }
    if (user.wallet) {
        connection++;
    }
    if (user.google) {
        connection++;
    }
    if (user.twitter) {
        connection++;
    }
    if (user.discord) {
        connection++;
    }
    if (user.steam) {
        connection++;
    }
    return connection;
}

export async function queryUser(userId: string): Promise<any> {
    await getMongoConnection();
    const aggregation = [
        {$match: {'user_id': userId, 'deleted_time': null}},
        {
            $lookup: {
                from: 'user_wallets',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'wallet',
                pipeline: [{$match: {'deleted_time': null}}, {
                    $project: {
                        _id: 0,
                        wallet_addr: 1,
                    }
                }],
            }
        },
        {
            $lookup: {
                from: 'user_googles',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'google',
                pipeline: [{$match: {'deleted_time': null}}, {
                    $project: {
                        _id: 0,
                        username: "$name",
                        avatar_url: "$picture"
                    }
                }],
            }
        },
        {
            $lookup: {
                from: 'user_twitters',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'twitter',
                pipeline: [{$match: {'deleted_time': null}}, {
                    $project: {
                        _id: 0,
                        username: "$name",
                        avatar_url: "$profile_image_url"
                    }
                }],
            }
        },
        {
            $lookup: {
                from: 'user_discords',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'discord',
                pipeline: [{$match: {'deleted_time': null}}, {
                    $project: {
                        _id: 0,
                        username: "$global_name",
                        avatar_url: "$avatar"
                    }
                }],
            }
        },
        {
            $lookup: {
                from: 'user_steams',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'steam',
                pipeline: [{$match: {'deleted_time': null}}, {
                    $project: {
                        _id: 0,
                        username: "$personaname",
                        avatar_url: "$avatar"
                    }
                }],
            }
        },
        {
            $project: {
                _id: 0,
                __v: 0,
                deleted_time: 0,
            }
        }
    ];

    const results = await User.aggregate(aggregation);
    // 由于 $lookup 返回的是数组，我们需要从数组中取出单个对象
    if (results.length > 0) {
        const user = results[0];
        user.wallet = user.wallet[0]?.wallet_addr || null;
        user.google = user.google[0] || null;
        user.twitter = user.twitter[0] || null;
        user.discord = user.discord[0] || null;
        user.steam = user.steam[0] || null;
        return user;
    } else {
        logger.error(`user ${userId} not found from db`);
        return null;
    }
}