import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { queryUser } from "@/lib/common/user";
import UserFavouriteNFT from "@/lib/models/UserFavouriteNFT";
import doTransaction from "@/lib/mongodb/transaction";
import ContractNFT from "@/lib/models/ContractNFT";
import logger from "@/lib/logger/winstonLogger";
import { enrichNFTMetadata } from "./list";

const router = createRouter<UserContextRequest, NextApiResponse>();

interface NFTData {
    chain_id: string;
    contract_address: string;
    token_id: number;
    sort: number;
}


router.use(mustAuthInterceptor).get(async (req, res) => {
    const userId = req.userId!;
    const favourites = await UserFavouriteNFT.find({ user_id: userId}).sort({ sort: 1 });
    if (!favourites || favourites.length == 0) {
        return res.json(response.success([]));
    }
    let nfts = [];
    for (const favourite of favourites) {
        const nft: any =  await ContractNFT.findOne({
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
    await enrichNFTMetadata(nfts);
    return res.json(response.success(nfts));
});

async function queryUserNFT(nfts: any[]) {
    return await ContractNFT.aggregate([
        {
            $match: {
                $or: nfts
            }
        },
        {
            $project: {
                '_id': 0,
                '__v': 0,
                'created_time': 0,
                'deleted_time': 0,
            }
        }
    ]);
}


router.use(mustAuthInterceptor).post(async (req, res) => {
    // 检查传递的{ chain_id, contract_address, token_id }数组对象
    const nfts: NFTData[] = req.body;
    if (!nfts || nfts.length == 0) {
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
            user_id: req.userId!,
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
        await UserFavouriteNFT.deleteMany({ user_id: req.userId }, { session });
        // 添加新的收藏
        await UserFavouriteNFT.insertMany(favourites, { session });
    });

    return res.json(response.success());
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