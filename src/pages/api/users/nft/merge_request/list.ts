import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { errorInterceptor } from "@/lib/middleware/error";
import { timeoutInterceptor } from "@/lib/middleware/timeout";
import connectToMongoDbDev from "@/lib/mongodb/client";
import ContractTokenMetadata from "@/lib/models/ContractTokenMetadata";
import ContractNFT from "@/lib/models/ContractNFT";
import UserWallet from "@/lib/models/UserWallet";
import Merge, { MergeStatus } from "@/lib/models/Merge";
import { el } from "date-fns/locale";
import { PipelineStage } from "mongoose";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor, timeoutInterceptor()).get(async (req, res) => {
    const {page_num, page_size} = req.query;
    if (!page_num || !page_size) {
        res.json(response.invalidParams());
        return
    }
    const pageNum = Number(page_num);
    const pageSize = Number(page_size);
    const userId = req.userId;
    // 获取用户绑定的钱包地址
    const userWallet = await UserWallet.findOne({user_id: userId, deleted_time: null});
    if (!userWallet) {
        // 未绑定钱包，返回默认值
        return res.json(response.success({
            total: 0,
            page_num: pageNum,
            page_size: pageSize,
            merges: [],
        }));
    }

    const pagination = await paginationMerges(userWallet.wallet_addr,pageNum, pageSize);
    if (pagination.total == 0 || pagination.data.length == 0) {
        // 当前没有匹配的数据
        return res.json(response.success({
            total: pagination.total,
            page_num: pageNum,
            page_size: pageSize,
            merges: [],
        }));
    }

    const merges = pagination.data;
    // 查询合并请求的token元信息
    const tokenIds = merges.flatMap(merge => merge.request_tokens ? merge.request_tokens : []);


    let merge: any;
    if (!tx_id) {
        // 查询用户的最新合并请求
        merge = await Merge.findOne({request_wallet_addr: userWallet.wallet_addr, deleted_time: null}, {_id:0}).sort({created_time: -1}).lean();
    }else {
        // 查询对应交易id的合并请求
        merge = await Merge.findOne({request_transaction_id: tx_id, deleted_time: null}, {_id:0}).lean();
    }
    // 如果不存在这样的合并请求则直接返回空
    if (!merge) {
        return res.json(response.success({
            merge: null,
        }));
    }
    // 检查合并请求的状态，如果存在目标网络的token_id则添加对应token的元信息
    if (merge.target_token_id) {
        const meta = await ContractTokenMetadata.findOne({
            chain_id: merge.target_chain_id,
            contract_address: merge.target_contract_address,
            token_id: merge.target_token_id
        }, {
            "_id": 0,
            "token_id": 1,
            "metadata.name": 1,
            "metadata.animation_url": 1
        });
        merge.token_metadata = meta?.metadata;
    }
    // 检查当前合并状态，只反馈requesting与merged两种状态
    if (merge.status !== MergeStatus.Merged) {
        merge.status = MergeStatus.Requesting;
    }
    return res.json(response.success({
        merge: {
            chain_id: merge.target_chain_id,
            contract_address: merge.target_contract_address,
            token_id: merge.target_token_id,
            status: merge.status,
            token_metadata: merge.token_metadata,
            confirmed_time: merge.confirmed_time,
            transaction_id: merge.target_transaction_id,
        },
    }));
});

async function enrichRequestNFTMetadata(merges: any[]) : Promise<void>{
    // 按照NFT的chain_id、contract_address进行分组token_id
    const mergeMap = new Map<string, any[]>();
    for (let merge of merges) {
        const key = `${merge.request_chain_id},${merge.request_contract_address}`;
        if (!mergeMap.has(key)) {
            mergeMap.set(key, []);
        }
        mergeMap.get(key)!.push(merge);
    }
    // 按token id分组查询NFT的元信息
    const mergeKeys = Array.from(mergeMap.keys());
    const metaQuery = mergeKeys.map(key => {
        const [chainId, contractAddress] = key.split(",");
        const tokenIds = mergeMap.get(key)!.flatMap(item => item.request_tokens ? item.request_tokens : []);
        return {
            chain_id: chainId,
            contract_address: contractAddress,
            token_id: {$in: tokenIds}
        }
    });
    const tokens = await ContractTokenMetadata.find({$or: metaQuery}, {
        "_id": 0,
        "chain_id": 1,
        "contract_address": 1,
        "token_id": 1,
        "metadata.name": 1,
        "metadata.animation_url": 1
    }).lean();
    const tokenMetadataMap = new Map<string, any>(tokens.map(token => [`${token.chain_id},${token.contract_address},${token.token_id}`, token.metadata]));
    // 封装NFT的元信息
    for (let merge of merges) {
        for (let tokenId of merge.request_tokens) {
            const key = `${merge.request_chain_id},${merge.request_contract_address},${tokenId}`;
            const metadata = tokenMetadataMap.get(key);
            // 如果token_metadata存在则移除chain_id、contract_address
            if (metadata) {
                delete metadata.chain_id;
                delete metadata.contract_address;
            }
            if ('request_token_metadata' in merge) {
                merge.request_token_metadata.push(metadata);
            }else {
                merge.request_token_metadata = [metadata];
            }
        }
    }
}

async function paginationMerges(walletAddr: string,pageNum: number, pageSize: number): Promise<{ total: number, data: any[] }> {
    const skip = (pageNum - 1) * pageSize;
    const now = Date.now();
    const aggregateQuery: PipelineStage[] = [
        {
            $match: {
                'request_wallet_addr': walletAddr,
                'deleted_time': null,
            }
        },
        {
            $sort: {
                // 按照请求时间倒序排列
                'request_confirmed_time': -1
            }
        },
        {
            $project: {
                '_id': 0,
                '__v': 0,
            }
        },
        {
            $facet: {
                metadata: [{$count: "total"}],
                data: [{$skip: skip}, {$limit: pageSize}]
            }
        }
    ];
    const results = await Merge.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return {total: 0, data: []}
    }
    return {total: results[0].metadata[0].total, data: results[0].data}
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