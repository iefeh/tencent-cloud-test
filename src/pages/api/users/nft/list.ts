import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {errorInterceptor} from "@/lib/middleware/error";
import {redis} from "@/lib/redis/client";
import User from "@/lib/models/User";
import {timeoutInterceptor} from "@/lib/middleware/timeout";
import getMongoConnection, {isDuplicateKeyError} from "@/lib/mongodb/client";
import UserWallet from "@/lib/models/UserWallet";
import {PipelineStage} from "mongoose";
import Quest from "@/lib/models/Quest";
import ContractTokenMetadata from "@/lib/models/ContractTokenMetadata";
import ContractNFT from "@/lib/models/ContractNFT";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor, timeoutInterceptor()).get(async (req, res) => {
    const userId = req.userId!;
    const {page_num, page_size} = req.query;
    if (!page_num || !page_size) {
        res.json(response.invalidParams());
        return
    }
    const pageNum = Number(page_num);
    const pageSize = Number(page_size);
    await getMongoConnection();
    // 检查用户当前绑定的钱包
    const wallet = await UserWallet.findOne({user_id: userId, deleted_time: null}, {_id: 0, wallet_addr: 1});
    if (!wallet) {
        // 当前没有匹配的数据
        return res.json(response.success({
            wallet_connected: false,
            total: 0,
            page_num: pageNum,
            page_size: pageSize,
            nfts: [],
        }));
    }
    // 检查用户的NFT
    const pagination = await paginationWalletNFTs(wallet.wallet_addr, pageNum, pageSize);
    if (pagination.total == 0) {
        // 当前没有匹配的数据
        return res.json(response.success({
            wallet_connected: true,
            total: 0,
            page_num: pageNum,
            page_size: pageSize,
            nfts: pagination.nfts,
        }));
    }
    const nfts = pagination.nfts;
    // 查询NFT的元信息
    // TODO:此处未判断token所在的链、合约
    const tokenIds = nfts.map(nft => nft.token_id);
    const tokens = await ContractTokenMetadata.find({token_id: {$in: tokenIds}}, {
        "_id": 0,
        "token_id": 1,
        "metadata.name": 1,
        "metadata.animation_url": 1
    });
    const tokenMap = new Map<string, any>(tokens.map(token => [token.token_id, token.metadata]));
    nfts.forEach(nft => nft.token_metadata = tokenMap.get(nft.token_id));
    return res.json(response.success({
        wallet_connected: true,
        total: pagination.total,
        page_num: pageNum,
        page_size: pageSize,
        nfts: nfts,
    }));
});

async function paginationWalletNFTs(wallet: string, pageNum: number, pageSize: number): Promise<{ total: number, nfts: any[] }> {
    const skip = (pageNum - 1) * pageSize;
    const aggregateQuery: PipelineStage[] = [
        {
            $match: {
                'wallet_addr': wallet,
                'deleted_time': null
            }
        },
        {
            $sort: {
                // 按获取进行降序排列
                'block_number': -1
            }
        },
        {
            $project: {
                '_id': 0,
                '__v': 0,
                'wallet_addr': 0,
                'contract_address':0,
                'created_time':0,
                'deleted_time': 0,
            }
        },
        {
            $facet: {
                metadata: [{$count: "total"}],
                data: [{$skip: skip}, {$limit: pageSize}]
            }
        }
    ];
    const results = await ContractNFT.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return {total: 0, nfts: []}
    }
    return {total: results[0].metadata[0].total, nfts: results[0].data}
}


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