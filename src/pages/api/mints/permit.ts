import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import Mint, { IMint } from "@/lib/models/Mint";
import Contract, { ContractCategory } from "@/lib/models/Contract";
import { redis } from "@/lib/redis/client";
import { NFTStorage } from 'nft.storage'

import Badges from "@/lib/models/Badge";
import doTransaction from "@/lib/mongodb/transaction";
import IpfsMetadata from "@/lib/models/IpfsMetadata";
import UserWallet from "@/lib/models/UserWallet";
import { ethers } from 'ethers';
import { chain, min } from "lodash";
import { contract } from "web3/lib/commonjs/eth.exports";

const nftStorage = new NFTStorage({ token: process.env.NFTSTORAGE_KEY! });


const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    const userId = req.userId;
    const { mint_id } = req.query;
    if (!mint_id) {
        return res.json(response.invalidParams());
    }
    const mint = await Mint.findOne({ id: mint_id });
    if (!mint) {
        return res.json(response.notFound("Mint not qualified"));
    }
    // 检查用户绑定的钱包
    const userWallet = await UserWallet.findOne({ user_id: userId, deleted_time: null });
    if (!userWallet) {
        return res.json(response.invalidParams("User wallet not bound"));
    }
    // 获取SBT合约
    const sbtContract = await Contract.findOne({ chain_id: mint.chain_id, category: ContractCategory.SBT });
    if (!sbtContract) {
        throw new Error("SBT contract not found");
    }
    const lockKey = `sbt_permit_lock:${mint_id}:${userId}`;
    const locked = await redis.set(lockKey, Date.now(), "EX", 15, "NX");
    if (!locked) {
        return res.json(response.tooManyRequests({
            message: "Verification is under a 15s waiting period, please try again later.",
        }));
    }
    mint.metadata_ipfs_hash = await getBadgeSeriesMetadataHash(mint);
    const permit = await constructMintPermit(mint, sbtContract.address, userWallet.wallet_addr);
    await redis.del(lockKey);
    return res.json(response.success({
        chain_id: mint.chain_id,
        contract_address: sbtContract.address,
        permit: permit,
    }));
});

async function constructMintPermit(mint:IMint,contractAddress:string, mintToAddr:string) {
    const domain = {
        name: "MoonveilBadges",
        version: "1",
        chainId: Number(mint.chain_id),
        verifyingContract: ethers.getAddress(contractAddress),
    };
    const types = {
        MintPermit: [
            { name: "uri", type: "string" },
            { name: "recipient", type: "address" },
            { name: "reqId", type: "bytes32" },
            { name: "expiredTime", type: "uint128" },
        ],
    };
    const expiredTime = Math.floor(Date.now()/1000 + 10*60*60);
    const mintPermit: any = {
        uri: mint.metadata_ipfs_hash,
        recipient: ethers.getAddress(mintToAddr),
        reqId: mint.id,
        expiredTime: expiredTime,
    };
    const signer = new ethers.Wallet(process.env.DEVELOPER_PRIVATE_KEY!, null);
    mintPermit.signature = await signer.signTypedData(domain, types, mintPermit);
    return mintPermit;
}

async function getBadgeSeriesMetadataHash(mint: IMint) {
    // 查询当前徽章的元数据
    const badge = await Badges.findOne({ id: mint.source_id }, { _id: 0, name:1, description:1, [`series.${mint.badge_level}`]: 1 });
    if (!badge || !badge.series.get(mint.badge_level)) {
        throw new Error("Badge series not found");
    }
    const series = badge.series.get(mint.badge_level);
    // 检查如果当前徽章的metadata_url存在，则直接返回
    if (series.metadata_ipfs_hash) {
        return series.metadata_ipfs_hash;
    }
    // 如果不存在，则构建metadata
    const metadata = {
        "name": badge.name,
        "description": badge.description,
        "image": series.image_url,
        "attributes": [{
            "trait_type": "Level",
            "value": mint.badge_level
        },
        {
            "value": "Moonveil SBT"
        }],
    };
    // 上传metadata
    const cid = await nftStorage.storeBlob(new Blob([JSON.stringify(metadata)]));
    await doTransaction(async (session) => {
        // 更新metadata_url
        await Badges.updateOne({ id: mint.source_id }, { 
            [`series.${mint.badge_level}.metadata_ipfs_hash`]: `ipfs://${cid}`,
        }, { session });
        // 更新mint的metadata_url
        await Mint.updateOne({ id: mint.id }, { metadata_ipfs_hash: `ipfs://${cid}` }, { session });
        // 添加元信息
        await IpfsMetadata.updateOne(
            { ipfs_hash: `ipfs://${cid}` },
            {
              $set: { 
                ipfs_access_url: `https://cloudflare-ipfs.com/ipfs/${cid}`,
                metadata: metadata,
               },
              $setOnInsert: {
                created_time: Date.now(),
              },
            },
            { upsert: true, session: session },
          );
    });
    return `ipfs://${cid}`;
}



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