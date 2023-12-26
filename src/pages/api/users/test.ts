import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import {RestClient} from "okx-api";
import {AxiosRequestConfig} from "axios";
import {CovalentClient} from "@covalenthq/client-sdk";
import {Web3} from "web3";
import {ethers} from "ethers";
import UserMetricReward, {checkMetricReward} from "@/lib/models/UserMetricReward";
import UserMetrics from "@/lib/models/UserMetrics";
import getMongoConnection from "@/lib/mongodb/client";
import {ConnectSteamQuest} from "@/lib/quests/implementations/connectSteamQuest";
import Quest from "@/lib/models/Quest";
import UserSteam from "@/lib/models/UserSteam";

const router = createRouter<UserContextRequest, NextApiResponse>();

// Covalent api 免费额度 RPS=4， 50$ RPS=100
router.get(async (req, res) => {
    try {
        await getMongoConnection();
        // const client = new CovalentClient("cqt_rQc36xBcjcB93vMVk846hdWyYJf7");
        // const resp = await client.BalanceService.getTokenBalancesForWalletAddress("eth-mainnet", "0x1260b33a7b1Ca6919c74d6212f2D17945222827f");
        // const resp = await client.NftService.getNftsForAddress("matic-mumbai", "0x58a7f8e93900A1A820B46C23DF3C0D9783b24D05");
        // console.log(resp.data);
        const quest = await Quest.findOne({id: "connect_steam"});
        const questWrapper = new ConnectSteamQuest(quest);
        const userSteam = new UserSteam({
            avatar: "",
            avatarfull: "",
            avatarhash: "",
            avatarmedium: "",
            commentpermission: "",
            communityvisibilitystate: undefined,
            created_time: 0,
            deleted_time: undefined,
            loccountrycode: "",
            personaname: "",
            personastate: 0,
            personastateflags: 0,
            primaryclanid: "",
            profilestate: 0,
            profileurl: "",
            realname: "",
            user_id: "test_user_2",
            steam_id: "76561198157621569",
            timecreated: 1071806400
        });
        // const result = await questWrapper.refreshUserSteamMetric("test_user_2", userSteam);
        const result = await questWrapper.claimReward("test_user_2");
        console.log(result);
        console.log();
    } catch (error) {
        console.error(error)
    }
    res.json(response.success());
});

/**
 * 使用web3.js验证Ethereum签名
 *
 * @param address 用户的Ethereum地址
 * @param message 签名的原始消息
 * @param signature 签名
 * @returns 如果签名有效则返回true，否则返回false
 */
function verifySignature(address: string, message: string, signature: string): boolean {
    try {
        // 使用ethers的工具函数恢复签名者地址
        const recoveredAddress = ethers.verifyMessage(message, signature);
        // 检查恢复的地址是否与用户提供的地址匹配
        return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
        console.error("签名验证错误:", error);
        return false;
    }
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