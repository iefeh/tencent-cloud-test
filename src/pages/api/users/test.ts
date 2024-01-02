import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import getMongoConnection from "@/lib/mongodb/client";
import * as Debank from "debank";
import Quest from "@/lib/models/Quest";
import {ConnectWalletQuest} from "@/lib/quests/implementations/connectWalletQuest";
import {JoinDiscordServerQuest} from "@/lib/quests/implementations/joinDiscordServerQuest";
import {redis} from "@/lib/redis/client";
import {getMBLeaderboardTopUsers, try2AddUser2MBLeaderboard} from "@/lib/redis/moonBeamLeaderboard";

const router = createRouter<UserContextRequest, NextApiResponse>();

// Covalent api 免费额度 RPS=4， 50$ RPS=100
router.get(async (req, res) => {
    try {
        await getMongoConnection();
        // const client = new CovalentClient("cqt_rQc36xBcjcB93vMVk846hdWyYJf7");
        // const resp = await client.BalanceService.getTokenBalancesForWalletAddress("eth-mainnet", "0x1260b33a7b1Ca6919c74d6212f2D17945222827f");
        // const resp = await client.NftService.getNftsForAddress("matic-mumbai", "0x58a7f8e93900A1A820B46C23DF3C0D9783b24D05");
        // console.log(resp.data);.

        // const quest = await Quest.findOne({id: "14b7f2c6-9b29-4ff9-8c4d-48cc5897ca84"});
        // const questWrapper = new JoinDiscordServerQuest(quest);
        // const result = await questWrapper.claimReward("8fd6aee0-fc87-46c5-96fe-4bb733cdbed5");
        // console.log(result);

        await try2AddUser2MBLeaderboard("d3dcf9e4-bf8c-4d66-87e7-12d4bf6aebe5")
        await try2AddUser2MBLeaderboard("78c3003c-d2a7-40aa-89dc-2839a9a6cf52");
        await try2AddUser2MBLeaderboard("8fd6aee0-fc87-46c5-96fe-4bb733cdbed5");

        const leaderboard = await getMBLeaderboardTopUsers("");
        res.json(response.success(leaderboard));
        return;
    } catch (error) {
        console.error(error)
    }
    res.json(response.success());
});

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