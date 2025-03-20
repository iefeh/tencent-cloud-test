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

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor, timeoutInterceptor()).get(async (req, res) => {
    const { tx_id } = req.query;
    // 获取用户绑定的钱包地址
    const userId = req.userId!;
    const userWallet = await UserWallet.findOne({user_id: userId, deleted_time: null});
    if (!userWallet) {
        // 未绑定钱包，返回默认值
        return res.json(response.success({
            merge: null,
        }));
    }
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

// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
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