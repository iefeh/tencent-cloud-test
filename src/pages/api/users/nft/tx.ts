import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {errorInterceptor} from "@/lib/middleware/error";
import {timeoutInterceptor} from "@/lib/middleware/timeout";
import getMongoConnection from "@/lib/mongodb/client";
import ContractTokenMetadata from "@/lib/models/ContractTokenMetadata";
import ContractNFT from "@/lib/models/ContractNFT";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor, timeoutInterceptor()).get(async (req, res) => {
    const {tx_id} = req.query;
    if (!tx_id) {
        res.json(response.invalidParams());
        return
    }
    await getMongoConnection();
    // 对应交易id的nft
    const nft = await ContractNFT.findOne({transaction_id: tx_id, deleted_time: null}, {
        '_id': 0,
        '__v': 0,
        'wallet_addr': 0,
        'contract_address': 0,
        'created_time': 0,
        'deleted_time': 0
    }).lean();
    if (!nft) {
        // 当前没有匹配的数据
        return res.json(response.success({
            nft: null,
        }));
    }
    // 查询NFT的元信息
    // TODO:此处未判断token所在的链、合约
    nft.token_metadata = await ContractTokenMetadata.findOne({token_id: nft.token_id}, {
        "_id": 0,
        "token_id": 1,
        "metadata.name": 1,
        "metadata.animation_url": 1
    });
    return res.json(response.success({
        nft: nft,
    }));
});

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler();
export const config = {
    api: {
        // 见https://nextjs.org/docs/pages/building-your-application/routing/api-routes#custom-config
        // 添加此配置以移除"API resolved without sending a response"警告
        externalResolver: true,
    },
}