import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import {RestClient} from "okx-api";
import {AxiosRequestConfig} from "axios";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.get(async (req, res) => {

    try {
        // @ts-ignore
        const config: AxiosRequestConfig = {
            headers: {
                'OK-ACCESS-PROJECT': '2c09c1f4dc44aafe78fd5af4387e25f8'
            },
        };
        const client = new RestClient({
            apiKey: "2c42251d-e5e5-4365-af2e-071221a77a92",
            apiSecret: "E255851080C5BE59400D641494878735",
            apiPass: "S1@qYBQ#6W#!yurA",
        }, 'demo', {}, config);
        const result = await client.postPrivate("/api/v5/waas/wallet/create-wallet", {
            addresses: [{
                "chainId": "1",
                "address": "0x1260b33a7b1Ca6919c74d6212f2D17945222827f"
            }],
            walletId: "13886e05-1265-4b79-8ac3-b7ab46211001",
        });
        console.log(result.data);
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