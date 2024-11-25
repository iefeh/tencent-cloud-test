import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { errorInterceptor } from "@/lib/middleware/error";
import User from "@/lib/models/User";
import { timeoutInterceptor } from "@/lib/middleware/timeout";
import UserWallet from "@/lib/models/UserWallet";
import { PipelineStage } from "mongoose";
import ContractTokenMetadata from "@/lib/models/ContractTokenMetadata";
import ContractNFT from "@/lib/models/ContractNFT";
import logger from "@/lib/logger/winstonLogger";
import Contract, { ContractCategory, IContract } from "@/lib/models/Contract";
import Mint from "@/lib/models/Mint";
import Badges from "@/lib/models/Badge";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor, timeoutInterceptor()).get(async (req, res) => {
    const userId = req.userId!;
    const { category, page_num, page_size } = req.query;
    if (!category || !page_num || !page_size) {
        res.json(response.invalidParams());
        return
    }
    const pageNum = Number(page_num);
    const pageSize = Number(page_size);
    // 查询目标合约类型
    const contracts = await Contract.find({ category: category });
    if (!contracts || contracts.length == 0) {
        logger.warn(`Contract not found: ${category}`);
        res.json(response.invalidParams());
        return
    }
    // 查询用户的托管钱包
    const user = await User.findOne({ user_id: userId }, { _id: 0, wallet_addr: 1 });
    if (!user) {
        logger.error(`User not found: ${userId}`);
        res.json(response.serverError());
        return
    }
    // 检查用户当前绑定的钱包
    const wallet = await UserWallet.findOne({ user_id: userId, deleted_time: null }, { _id: 0, wallet_addr: 1 });
    const wallets = [user.particle?.evm_wallet, wallet?.wallet_addr];
    // 检查用户的NFT
    const pagination = await paginationWalletNFTs(contracts, wallets, pageNum, pageSize);
    if (pagination.total == 0 || pagination.nfts.length == 0) {
        // 当前没有匹配的数据
        return res.json(response.success({
            wallet_connected: true,
            total: pagination.total,
            page_num: pageNum,
            page_size: pageSize,
            nfts: pagination.nfts,
        }));
    }
    const nfts = pagination.nfts;
    if (category == ContractCategory.SBT) {
        await enrichSBTMetadata(contracts, nfts);
    } else {
        await enrichNFTMetadata(contracts, nfts);
    }

    return res.json(response.success({
        wallet_connected: true,
        total: pagination.total,
        page_num: pageNum,
        page_size: pageSize,
        nfts: nfts,
    }));
});

export async function enrichNFTMetadata(contracts: IContract[], nfts: any[]): Promise<void> {
    for (let nft of nfts) {
        // 检查NFT的实际状态，如果NFT存在locked_as则需要修正当前的状态
        if (nft.locked_as) {
            nft.status = nft.locked_as;
            delete nft.locked_as;
            delete nft.locked_time;
        }
        // 设置NFT的类型，浏览器地址
        const contract = contracts.find(contract => contract.chain_id == nft.chain_id && contract.address == nft.contract_address);
        nft.type = contract?.category;
        nft.expolorer_url = contract?.expolorer_url;
    }
    // 按照NFT的chain_id、contract_address进行分组token_id
    const nftMap = new Map<string, any[]>();
    for (let nft of nfts) {
        const key = `${nft.chain_id},${nft.contract_address}`;
        if (!nftMap.has(key)) {
            nftMap.set(key, []);
        }
        nftMap.get(key)!.push(nft);
    }
    // 按token id分组查询NFT的元信息
    const nftKeys = Array.from(nftMap.keys());
    const nftQuery = nftKeys.map(key => {
        const [chainId, contractAddress] = key.split(",");
        return {
            chain_id: chainId,
            contract_address: contractAddress,
            token_id: { $in: nftMap.get(key)!.map(nft => nft.token_id) }
        }
    });
    const tokens = await ContractTokenMetadata.find({ $or: nftQuery }, {
        "_id": 0,
        "chain_id": 1,
        "contract_address": 1,
        "token_id": 1,
        "metadata.name": 1,
        "metadata.animation_url": 1,
        "metadata.image": 1,
        "metadata.description": 1,
    }).lean();
    const tokenMetadataMap = new Map<string, any>(tokens.map(token => [`${token.chain_id},${token.contract_address},${token.token_id}`, token.metadata]));
    // 封装NFT的元信息
    for (let nft of nfts) {
        const key = `${nft.chain_id},${nft.contract_address},${nft.token_id}`;
        nft.token_metadata = tokenMetadataMap.get(key);
        // 如果token_metadata存在则移除chain_id、contract_address
        if (nft.token_metadata) {
            delete nft.token_metadata.chain_id;
            delete nft.token_metadata.contract_address;
        }
    }
}

async function paginationWalletNFTs(contracts: IContract[], wallets: string[], pageNum: number, pageSize: number): Promise<{ total: number, nfts: any[] }> {
    // 构建查询的合约
    let contractsFilter = contracts.map(contract => {
        return {
            chain_id: contract.chain_id,
            contract_address: contract.address
        };
    });
    const skip = (pageNum - 1) * pageSize;
    const aggregateQuery: PipelineStage[] = [
        {
            $match: {
                $or: contractsFilter
            }
        },
        {
            $match: {
                'wallet_addr': { $in: wallets },
                'deleted_time': null
            }
        },
        {
            $sort: {
                // 按获取进行降序排列
                'created_time': -1
            }
        },
        {
            $project: {
                '_id': 0,
                '__v': 0,
                'created_time': 0,
                'deleted_time': 0,
            }
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: pageSize }]
            }
        }
    ];
    const results = await ContractNFT.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return { total: 0, nfts: [] }
    }
    return { total: results[0].metadata[0].total, nfts: results[0].data }
}

export async function enrichSBTMetadata(contracts: IContract[], nfts: any[]): Promise<void> {
    for (let nft of nfts) {
        // 检查NFT的实际状态，如果NFT存在locked_as则需要修正当前的状态
        if (nft.locked_as) {
            nft.status = nft.locked_as;
            delete nft.locked_as;
            delete nft.locked_time;
        }
        // 设置NFT的类型，浏览器地址
        const contract = contracts.find(contract => contract.chain_id == nft.chain_id && contract.address == nft.contract_address);
        nft.type = contract?.category;
        nft.expolorer_url = contract?.expolorer_url;
    }
    // 根据交易HASH查询MINT信息
    const txHashes = nfts.map(n => n.transaction_id);
    const mints = await Mint.find({ transaction_hash: { $in: txHashes } });
    const badgesIds = mints.map(m => m.source_id);
    const badges = await Badges.find({ id: { $in: badgesIds } });
    const idBadgeMap: Map<string, any> = new Map<string, any>(badges.map(b => [b.id, b]));
    const hashMintMap: Map<string, any> = new Map<string, any>(mints.map(m => [m.transaction_hash, m]));

    for (let nft of nfts) {
        const txHash = nft.transaction_id;
        const mint = hashMintMap.get(txHash);
        const badge = idBadgeMap.get(mint.source_id);
        nft.token_metadata = badge.series.get(mint.badge_level).metadata;
        if (!nft.token_metadata) {
            continue;
        }
        delete nft.token_metadata.attributes;
    }
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