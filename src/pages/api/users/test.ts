import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import connectToMongoDbDev from "@/lib/mongodb/client";
import {queryUserAuth} from "@/lib/common/user";
import {getClientIP, HttpsProxyGet} from "@/lib/common/request";
import Quest from "@/lib/models/Quest";
import {ConnectSteamQuest} from "@/lib/quests/implementations/connectSteamQuest";
import {ConnectWalletQuest} from "@/lib/quests/implementations/connectWalletQuest";
import WalletAsset, {IWalletAsset, WalletNFT} from "@/lib/models/WalletAsset";
import doTransaction from "@/lib/mongodb/transaction";
import UserMoonBeamAudit, {UserMoonBeamAuditType} from "@/lib/models/UserMoonBeamAudit";
import QuestAchievement from "@/lib/models/QuestAchievement";
import UserMetrics, {Metric} from "@/lib/models/UserMetrics";
import User from "@/lib/models/User";
import {try2AddUsers2MBLeaderboard} from "@/lib/redis/moonBeamLeaderboard";
import {allowIP2VerifyWalletAsset, retryAllowToSendRequest2Reservoir} from "@/lib/redis/ratelimit";
import logger from "@/lib/logger/winstonLogger";
import {redis} from "@/lib/redis/client";

import Moralis from 'moralis';

import UserMetricReward, {checkMetricReward, IUserMetricReward} from "@/lib/models/UserMetricReward";
import {AuthorizationType} from "@/lib/authorization/types";
import {promiseSleep} from "@/lib/common/sleep";
import {v4 as uuidv4} from "uuid";
import {randomBytes, createHash} from 'crypto';

const sdk = require('api')('@reservoirprotocol/v3.0#j7ej3alr9o3etb');
sdk.auth('df3d5e86-4d76-5375-a4bd-4dcae064a0e8');
sdk.server('https://api.reservoir.tools');

const router = createRouter<UserContextRequest, NextApiResponse>();

function generateSecretKey(length: number = 32): string {
    // 生成指定长度的随机字节
    const secretKey = randomBytes(length);
    // 将随机字节转换为 base64 编码以便于存储和使用
    return secretKey.toString('base64');
}

// Covalent api 免费额度 RPS=4， 50$ RPS=100
router.get(async (req, res) => {
    console.log("client id:", uuidv4());
    console.log("client sec:", generateSecretKey());

    const base64URLEncode = str => str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')

// This is the code_verifier, which is INITIALLY KEPT SECRET on the client
// and which is later passed as request param to the token endpoint.
// DO NOT SEND this with the authorization request!
    const codeVerifier = base64URLEncode(randomBytes(32))

// This is the hashed version of the verifier, which is sent to the authorization endpoint.
// This is named t(code_verifier) in the above workflow
// Send this with the authorization request!
    const codeChallenge = base64URLEncode(createHash('sha256').update(codeVerifier).digest())

// This is the name of the code challenge method
// This is named t_m in the above workflow
// Send this with the authorization request!
    const codeChallengeMethod = 'S256'
    console.log("codeVerifier:", codeVerifier);
    console.log("codeChallenge:", codeChallenge);
    console.log("codeChallengeMethod:", codeChallengeMethod);
    try {
        // const client = new CovalentClient("cqt_rQc36xBcjcB93vMVk846hdWyYJf7");
        // const resp = await client.BalanceService.getTokenBalancesForWalletAddress("eth-mainnet", "0x1260b33a7b1Ca6919c74d6212f2D17945222827f");
        // const resp = await client.NftService.getNftsForAddress("matic-mumbai", "0x58a7f8e93900A1A820B46C23DF3C0D9783b24D05");
        // console.log(resp.data);.
        // console.log(await queryUserAuth("4fa8b6f9-d296-4e63-af85-19ce2d9c2cfa"));

        // const quest = await Quest.findOne({id: "b4551b52-1a3f-4b75-8975-1f656d1cd8d5"});
        // const questWrapper = new ConnectWalletQuest(quest);
        // const result = await questWrapper.refreshUserWalletMetric("check_user_1", "0x8728c811f93eb6ac47d375e6a62df552d62ed284");
        // console.log(result);


        res.json(response.success());
        return;
    } catch (error) {
        logger.error(error)
    }
    res.json(response.success());
});


async function reVerifyUsersWalletQuest() {
    // 获取基本信息
    const quest = await Quest.findOne({id: "331a0cfd-0393-4c07-a7f9-91c56d709748"});
    const rewards = await UserMetricReward.find({id: {$in: quest.reward.range_reward_ids}});

    // 重新校验用户的资产信息
    let pageNum = 1;
    let pageSiz = 100;
    while (true) {
        const users = await findUsers2ReverifyWalletAsset(pageNum, pageSiz);
        if (users.length == 0) {
            return;
        }
        console.log(users);
        for (let userId of users) {
            logger.debug(`reverifing user ${userId}`);
            await reVerifyWalletQuest(userId, quest, rewards);
        }
    }
}

async function reVerifyWalletQuest(userId: string, quest: any, rewards: any) {
    // 获取用户的最新资产信息
    const asset = await WalletAsset.findOne({
        'user_id': userId,
        'reservoir_value': {$exists: true},
        'reverified': null,
    }).sort({created_time: -1})
    const now = Date.now();
    // 重新计算用户的资产信息
    const userMetric: any = {
        [Metric.WalletAssetValueLastRefreshTime]: now,
        [Metric.WalletAssetId]: asset.id,
        [Metric.WalletTokenUsdValue]: asset.token_usd_value,
        [Metric.WalletNftUsdValue]: asset.reservoir_value,
        [Metric.WalletAssetUsdValue]: asset.token_usd_value + asset.reservoir_value,
    }
    // 计算用户的当前奖励
    const rewardDelta = checkUserRewardDeltaFromUserMetric(userId, userMetric, rewards);
    // 保存用户全新奖励，移除历史奖励
    const taint = `${quest.id},${AuthorizationType.Wallet},${asset.wallet_addr}`;
    const audit = new UserMoonBeamAudit({
        user_id: userId,
        type: UserMoonBeamAuditType.Quests,
        moon_beam_delta: rewardDelta,
        reward_taint: taint,
        corr_id: quest.id,
        extra_info: asset.id,
        created_time: now,
    });
    let historyReward = await UserMoonBeamAudit.findOne({user_id: userId, corr_id: quest.id, deleted_time: null});
    if (!historyReward) {
        logger.debug(`user ${userId} not verified`);
        await WalletAsset.updateMany({user_id: userId}, {
            reverified: true
        });
        return;
    }
    historyReward.deleted_time = now;
    // 用户的MB增量
    const increasedReward = rewardDelta - historyReward.moon_beam_delta;
    logger.debug(`user ${userId} delta ${increasedReward}`);
    await doTransaction(async (session) => {
        const opts = {session};
        // 更新用户的校验标识
        await WalletAsset.updateMany({user_id: userId}, {
            reverified: true,
            total_usd_value: userMetric.wallet_asset_usd_value
        }, opts);
        if (increasedReward == 0) {
            // 如果用户的更改为0则跳过处理
            return;
        }
        // 保存用户最新的指标
        await UserMetrics.updateOne(
            {user_id: userId},
            {
                $set: userMetric,
                $setOnInsert: {
                    "created_time": now,
                }
            },
            {
                session: session,
                upsert: true
            }
        )
        // 移除用户的历史校验记录
        await historyReward.save(opts);
        // 添加新的校验记录
        await audit.save(opts);
        // 更新用户的MB
        await User.updateOne({user_id: userId}, {$inc: {moon_beam: increasedReward}}, opts);
    })
    // 刷新用户的缓存
    if (increasedReward != 0) {
        await try2AddUsers2MBLeaderboard(userId);
    }
    // await promiseSleep(10000);
}

function checkUserRewardDeltaFromUserMetric(userId: string, userMetric: any, rewards: any[]): number {
    // 检查用户指标是否存在，不存在时直接报错
    for (let reward of rewards) {
        if (reward.require_metric in userMetric) {
            continue;
        }
        throw new Error(`quest ${this.quest.id} reward ${reward.id} want metric ${reward.require_metric} but not found from user ${userId}`);
    }
    // 计算用户总计奖励数量
    let totalReward = 0;
    rewards.forEach(reward => {
        const userMetricValue = userMetric[reward.require_metric];
        const rewardItem = checkMetricReward(userMetricValue, reward);
        if (rewardItem) {
            logger.debug(`user ${userId} reached ${reward.require_metric} reward MB ${rewardItem.reward_moon_beam}`);
            totalReward += rewardItem.reward_moon_beam!;
        }
    });
    return totalReward;
}


async function findUsers2ReverifyWalletAsset(pageNumber, pageSize) {
    const skip = (pageNumber - 1) * pageSize;

    // 使用聚合管道进行查询
    const result = await WalletAsset.aggregate([
        {
            '$match': {
                'reservoir_value': {$exists: true},
                'reverified': null,
            }
        },
        {
            $group: {
                _id: "$user_id", // 使用 wallet_addr 字段的值作为去重后的_id
            }
        },
        {
            $sort: {_id: 1} // 根据 wallet_addr (_id) 排序
        },
        {
            $skip: skip // 跳过前面的结果
        },
        {
            $limit: pageSize // 限制返回的结果数量
        },
        {
            $project: {user_id: "$_id", _id: 0}
        }
    ]).exec();

    return result.map(item => item.user_id);
}


async function syncUserReservoirNftVal() {
    try {
        let pageNum = 1;
        let pageSiz = 100;
        while (true) {
            const syncedCol = new Map<string, boolean>();
            const wallets = await findDistinctWalletAddresses(pageNum, pageSiz);
            if (!wallets) {
                return;
            }
            if (wallets.length == 0) {
                return;
            }
            for (let wallet of wallets) {
                if (syncedCol.has(wallet)) {
                    continue;
                }
                syncedCol.set(wallet, true);
                const totalVal = await syncUserCollections(wallet);
                await WalletAsset.updateMany({wallet_addr: wallet}, {reservoir_value: totalVal});
            }
        }

    } catch (error) {
        console.error("Failed to fetch NFTs:", error);
    }
}

async function findDistinctWalletAddresses(pageNumber, pageSize) {
    const skip = (pageNumber - 1) * pageSize;

    try {
        // 使用聚合管道进行查询
        const result = await WalletAsset.aggregate([
            {
                '$match': {
                    'nft_usd_value': {
                        '$gt': 0
                    },
                    'reservoir_value': null
                }
            },
            {
                '$sort': {
                    'nft_usd_value': -1
                }
            },
            {
                $skip: skip // 跳过前面的结果
            },
            {
                $limit: pageSize // 限制返回的结果数量
            },
            {
                $project: {wallet_addr: 1, _id: 0}
            }
        ]).exec();

        return result.map(item => item.wallet_addr);
    } catch (error) {
        console.error('Error fetching distinct wallet addresses: ', error);
        throw error;
    }
}

// 尝试同步用户地址下的合约集合;
async function syncUserCollections(address: string) {
    try {
        let verifiedNFTs = [];
        let offset = 0;
        let batch = 100;
        let hasMore = true;
        let total = 0;
        while (hasMore) {
            // await retryAllowToSendRequest2Reservoir(60);
            const response = await sdk.getUsersUserCollectionsV3({
                excludeSpam: 'true',
                limit: batch,
                user: address,
                offset: offset,
                accept: '*/*'
            });
            const collections = response.data.collections;
            if (collections && collections.length > 0) {
                collections.forEach(coll => {
                    const col = coll.collection;
                    /**
                     * The collection's approval status within OpenSea.
                     * Can be one of:
                     * - not_requested: brand new collections
                     * - requested: collections that requested safelisting on our site
                     * - approved: collections that are approved on our site and can be found in search results
                     * - verified: verified collections
                     */
                    if (col.openseaVerificationStatus != "verified") {
                        return;
                    }
                    // 计算用户持有的NFT的价值
                    const usdVal = col.floorAskPrice?.amount?.usd;
                    if (!usdVal) {
                        console.log(`col ${col.id} usd value not found`,);
                        return;
                    }
                    const own = coll.ownership?.tokenCount;
                    if (!own) {
                        console.log(`col ${col.id} own not found`,);
                        return;
                    }
                    verifiedNFTs.push(coll);
                    total += Number(usdVal) * Number(own);
                });
                offset += collections.length;
            } else {
                // 没有更多数据时停止循环
                hasMore = false;
            }
        }
        logger.debug(`wallet: ${address},  total:, ${total},   nft:, ${verifiedNFTs.length}`);
        return total;
    } catch (error) {
        console.error("Failed to fetch NFTs:", error);
        return 0;
    }
}

// opensea支持的链 https://docs.opensea.io/reference/supported-chains
async function queryUserVerifiedNFTs(address: string) {
    await Moralis.start({
        apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Ijk0OTU3MmZlLTg3ODMtNDExNy1iZTkzLTFmN2NkYzhjMjJhYyIsIm9yZ0lkIjoiMzcxNjkxIiwidXNlcklkIjoiMzgxOTk0IiwidHlwZUlkIjoiNGEwN2ZjM2UtMWVhZS00YTU5LWEzYjYtMjU0MjU4MWQyMjY0IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDQ5NTMxOTUsImV4cCI6NDg2MDcxMzE5NX0.35yJtJ4EfY_O7HLFr2TMuUX6XXMTCvayEiXo_6Cb-b4",
    });
    try {
        let verifiedNFTs = [];
        let cursor = null;
        let hasMore = true;

        while (hasMore) {
            const res = await Moralis.EvmApi.nft.getWalletNFTs({
                format: "decimal",
                mediaItems: false,
                excludeSpam: true,
                address: address,
                cursor: cursor
            });
            const data = res.raw;
            if (data && data.result) {
                verifiedNFTs = verifiedNFTs.concat(data.result);
                cursor = data.cursor;
                hasMore = !!cursor;
            } else {
                // 没有更多数据时停止循环
                hasMore = false;
            }
        }

        return verifiedNFTs;
    } catch (error) {
        console.error("Failed to fetch NFTs:", error);
        return [];
    }
}

async function refreshUserMoonbeamCache() {
    const limit = 2000; // 每页显示的记录数，可以根据需要调整
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
        const users = await User.find({moon_beam: {$gt: 0}}, {
            _id: 0,
            moon_beam: 1,
            user_id: 1
        }).skip(skip).limit(limit);

        // 处理当前批次的记录
        for (let user of users) {
            // console.log(user);
            // throw new Error(`test interrupted`);
            redis.zadd("moon_beam_lb", user.moon_beam, user.user_id);
        }
        // 更新 skip 值，准备读取下一页
        skip += users.length;
        // 检查是否还有更多记录
        if (users.length < limit) {
            hasMore = false;
        }
    }
}

async function loadMoonbeamIntoCache() {
    const users = await User.find({moon_beam: {$gte: 0}}, {_id: 0, user_id: 1});
    for (let user of users) {
        await try2AddUsers2MBLeaderboard(user.user_id);
    }
}


async function checkUserAssets() {
    const limit = 10; // 每页显示的记录数，可以根据需要调整
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
        const assets = await WalletAsset.find().skip(skip).limit(limit);

        // 处理当前批次的记录
        for (let asset of assets) {
            await checkUserAsset(asset);
        }
        // 更新 skip 值，准备读取下一页
        skip += assets.length;
        // 检查是否还有更多记录
        if (assets.length < limit) {
            hasMore = false;
        }
    }
}

async function checkUserAsset(asset: any) {
    const totalTokenValue = asset.token_usd_value;
    // 要求用户的NFT价值至少大于1刀
    const nfts = asset.nfts.filter((nft: WalletNFT) => nft.usd_price >= 1);
    let totalNFTValue = nfts.reduce((sum: number, nft: WalletNFT) => {
        console.log(nft.usd_price, "   ", nft.amount);
        // 如果NFT的数量超过100，且NFT的单价不超过20则过滤
        if (nft.amount > 100 && nft.usd_price < 20) {
            return sum;
        }
        // NFT的价值保留4位小数
        const nftVal = Number(nft.usd_price.toFixed(4));
        // 根据最新成交价格评估NFT价值
        return sum + nftVal * nft.amount;
    }, 0);
    totalNFTValue = Number(totalNFTValue.toFixed(2));
    const totalValue = Number((totalNFTValue + totalTokenValue).toFixed(2));
    // 检查总价值差距
    // const valueDiff = Math.abs(asset.total_usd_value - totalValue);
    // if (valueDiff < 1000) {
    //     return;
    // }
    // console.log(`=====================================`);
    // // 当前用户的差异较大
    // const userId = asset.user_id;
    // const walletQuestId = "331a0cfd-0393-4c07-a7f9-91c56d709748";
    // // 查找用户的奖励
    // const audit = await UserMoonBeamAudit.findOne({
    //     user_id: userId,
    //     corr_id: walletQuestId,
    //     deleted_time: null,
    // });
    // if (!audit) {
    //     // console.log(`user ${userId} quest audit maybe cleared`);
    //     return;
    // }
    // console.log(`user ${userId} ${totalValue} VS ${asset.total_usd_value}`);
    //
    // await doTransaction(async function (session) {
    //     const opts = {session: session};
    //     // 移除用户的MB奖励
    //     await UserMoonBeamAudit.updateOne({
    //         user_id: asset.user_id,
    //         corr_id: walletQuestId,
    //     }, {deleted_time: Date.now()}, opts);
    //     // 移除用户的任务达成
    //     await QuestAchievement.deleteOne({user_id: userId, quest_id: walletQuestId}, opts);
    //     // 移除用户的任务指标
    //     await UserMetrics.updateOne({user_id: userId}, {
    //         $unset: {
    //             wallet_asset_id: "",
    //             wallet_asset_usd_value: "",
    //             wallet_asset_value_last_refresh_time: "",
    //             wallet_nft_usd_value: "",
    //             wallet_token_usd_value: ""
    //         }
    //     }, opts);
    //     // 减少用户的MB
    //     await User.updateOne({user_id: userId}, {$inc: {moon_beam: -audit.moon_beam_delta}}, opts);
    // });
    // // 重新加载用户的MB记录
    // await try2AddUser2MBLeaderboard(userId);
    // console.log(`user ${userId} data cleared.`);
}


// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});
export const config = {
    api: {
        bodyParser: false,
    },
};