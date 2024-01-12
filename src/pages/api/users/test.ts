import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import getMongoConnection from "@/lib/mongodb/client";
import {queryUserAuth} from "@/lib/common/user";
import {getClientIP, HttpsProxyGet} from "@/lib/common/request";
import Quest from "@/lib/models/Quest";
import {ConnectSteamQuest} from "@/lib/quests/implementations/connectSteamQuest";
import {ConnectWalletQuest} from "@/lib/quests/implementations/connectWalletQuest";
import WalletAsset, {IWalletAsset, WalletNFT} from "@/lib/models/WalletAsset";
import doTransaction from "@/lib/mongodb/transaction";
import UserMoonBeamAudit from "@/lib/models/UserMoonBeamAudit";
import QuestAchievement from "@/lib/models/QuestAchievement";
import UserMetrics from "@/lib/models/UserMetrics";
import User from "@/lib/models/User";
import {try2AddUser2MBLeaderboard} from "@/lib/redis/moonBeamLeaderboard";
import {allowIP2VerifyWalletAsset} from "@/lib/redis/ratelimit";
import logger from "@/lib/logger/winstonLogger";

const router = createRouter<UserContextRequest, NextApiResponse>();

// Covalent api 免费额度 RPS=4， 50$ RPS=100
router.get(async (req, res) => {
    try {
        await getMongoConnection();
        // const client = new CovalentClient("cqt_rQc36xBcjcB93vMVk846hdWyYJf7");
        // const resp = await client.BalanceService.getTokenBalancesForWalletAddress("eth-mainnet", "0x1260b33a7b1Ca6919c74d6212f2D17945222827f");
        // const resp = await client.NftService.getNftsForAddress("matic-mumbai", "0x58a7f8e93900A1A820B46C23DF3C0D9783b24D05");
        // console.log(resp.data);.
        // console.log(await queryUserAuth("4fa8b6f9-d296-4e63-af85-19ce2d9c2cfa"));

        // const quest = await Quest.findOne({id: "b4551b52-1a3f-4b75-8975-1f656d1cd8d5"});
        // const questWrapper = new ConnectWalletQuest(quest);
        // const result = await questWrapper.refreshUserWalletMetric("check_user_1", "0x8728c811f93eb6ac47d375e6a62df552d62ed284");
        // console.log(result);

        // const asset = await WalletAsset.findOne({user_id: "155b6465-3f06-4678-a275-ad8621511942"});
        // await checkUserAsset(asset);
        // await checkUserAssets();

        // await loadMoonbeamIntoCache();

        throw new Error(`test error`);
        res.json(response.success());
        return;
    } catch (error) {
        logger.error(error)
    }
    res.json(response.success());
});


async function loadMoonbeamIntoCache() {
    const users = await User.find({moon_beam: {$gte: 0}}, {_id: 0, user_id: 1});
    for (let user of users) {
        await try2AddUser2MBLeaderboard(user.user_id);
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