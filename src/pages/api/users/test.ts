import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import getMongoConnection from "@/lib/mongodb/client";
import {queryUserAuth} from "@/lib/common/user";
import {HttpsProxyGet} from "@/lib/common/request";

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
        const response1 = await HttpsProxyGet("https://ip.smartproxy.com/json");
        console.log(response1.data);
        res.json(response.success());
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
export const config = {
    api: {
        bodyParser: false,
    },
};