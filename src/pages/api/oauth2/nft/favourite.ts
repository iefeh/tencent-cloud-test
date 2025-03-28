import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import UserFavouriteNFT from "@/lib/models/UserFavouriteNFT";
import doTransaction from "@/lib/mongodb/transaction";
import ContractNFT from "@/lib/models/ContractNFT";
import logger from "@/lib/logger/winstonLogger";
import { enrichNFTMetadata } from "./list";
import Contract from "@/lib/models/Contract";
import { UserContextRequest, dynamicCors } from "@/lib/middleware/auth";
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import { responseOnOauthError } from "@/lib/oauth2/response";
import { Request, Response } from '@node-oauth/oauth2-server';
import OAuth2Server from '@/lib/oauth2/server';

const router = createRouter<UserContextRequest, NextApiResponse>();

interface NFTData {
    chain_id: string;
    contract_address: string;
    token_id: number;
    sort: number;
}


router.use(dynamicCors).get(async (req, res) => {
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
        const userId = token.user.user_id;
        const favourites = await UserFavouriteNFT.find({ user_id: userId }).sort({ sort: 1 });
        if (!favourites || favourites.length == 0) {
            return res.json(response.success([]));
        }
        let nfts = [];
        for (const favourite of favourites) {
            const nft: any = await ContractNFT.findOne({
                chain_id: favourite.chain_id,
                contract_address: favourite.contract_address,
                token_id: favourite.token_id,
            }, {
                _id: 0,
                __v: 0,
                created_time: 0,
                deleted_time: 0,
            }).lean();
            nft.sort = favourite.sort;
            nfts.push(nft);
        }
        // 查询所有的合约
        const contracts = await Contract.find({});
        await enrichNFTMetadata(contracts, nfts);
        return res.json(response.success(nfts));
    } catch (error: any) {
        return responseOnOauthError(res, error);
    }
});

router.use(dynamicCors).post(async (req, res) => {
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
        // 检查传递的{ chain_id, contract_address, token_id }数组对象
        const nfts: NFTData[] = req.body;
        if (!nfts) {
            return res.json(response.invalidParams());
        }
        // 检查NFT是否存在，此处暂未校验NFT是否属于用户
        for (const nft of nfts) {
            if (!nft.chain_id || !nft.contract_address || !nft.token_id) {
                return res.json(response.invalidParams());
            }
            const got = await ContractNFT.findOne({
                chain_id: nft.chain_id,
                contract_address: nft.contract_address,
                token_id: Number(nft.token_id),
                deleted_time: null,
            });
            if (!got) {
                logger.warn(`NFT not found: ${nft.chain_id} ${nft.contract_address} ${nft.token_id}`);
                return res.json(response.invalidParams());
            }
        }
        const favourites = nfts.map((nft) => {
            return new UserFavouriteNFT({
                user_id: token.user.user_id,
                chain_id: nft.chain_id,
                contract_address: nft.contract_address,
                token_id: Number(nft.token_id),
                sort: nft.sort,
                created_time: Date.now(),
            });
        });
        // 开启事务
        await doTransaction(async (session) => {
            // 移除当前用户的历史收藏
            await UserFavouriteNFT.deleteMany({ user_id: token.user.user_id }, { session });
            // 添加新的收藏
            await UserFavouriteNFT.insertMany(favourites, { session });
        });

        return res.json(response.success());
    } catch (error: any) {
        return responseOnOauthError(res, error);
    }
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

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});