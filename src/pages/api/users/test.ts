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
import * as Debank from "debank";
// const Debank = require('debank')

const router = createRouter<UserContextRequest, NextApiResponse>();

// Covalent api 免费额度 RPS=4， 50$ RPS=100
router.get(async (req, res) => {
    try {
        await getMongoConnection();
        // const client = new CovalentClient("cqt_rQc36xBcjcB93vMVk846hdWyYJf7");
        // const resp = await client.BalanceService.getTokenBalancesForWalletAddress("eth-mainnet", "0x1260b33a7b1Ca6919c74d6212f2D17945222827f");
        // const resp = await client.NftService.getNftsForAddress("matic-mumbai", "0x58a7f8e93900A1A820B46C23DF3C0D9783b24D05");
        // console.log(resp.data);
        const debank = new Debank(process.env.DEBANK_ACCESS_KEY);
        const data = await debank.user.total_balance({id: '0x1260b33a7b1Ca6919c74d6212f2D17945222827f'})
        const tokens = {
            total_usd_value: data.total_usd_value,
            chain_list: data.chain_list.filter(chain => chain.usd_value > 0),
        };
        console.log(tokens);
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