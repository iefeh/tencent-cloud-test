import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Mint, {IMint} from "@/lib/models/Mint";
import Contract, {ContractCategory} from "@/lib/models/Contract";
import {redis} from "@/lib/redis/client";

import Badges, {IBadges} from "@/lib/models/Badge";
import doTransaction from "@/lib/mongodb/transaction";
import IpfsMetadata from "@/lib/models/IpfsMetadata";
import UserWallet from "@/lib/models/UserWallet";
import {ethers} from 'ethers';

const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({pinataJWTKey: process.env.PINATA_JWT!});

const router = createRouter<UserContextRequest, NextApiResponse>();

router.get(async (req, res) => {
    const {badge_id, level} = req.query;
    if (!badge_id || !level) {
        return res.json(response.invalidParams());
    }
    
    const ipfsHash = await getBadgeSeriesMetadataHash(badge_id as string, level as string);
    return res.json(response.success({
        ipfs_hash: ipfsHash
    }));
});

async function getBadgeSeriesMetadataHash(badge_id: string, level: string) {
    // 查询当前徽章的元数据
    const badge = await Badges.findOne({id: badge_id}, {
        _id: 0,
        name: 1,
        description: 1,
        [`series.${level}`]: 1
    }) as IBadges;
    if (!badge || !badge.series.get(level)) {
        throw new Error("Badge series not found");
    }
    const series = badge.series.get(level);
    if (!series) {
        throw new Error("Badge series not found");
    }
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
            "value": level
        },
            {
                "value": "Moonveil SBT"
            }],
    };
    // 上传metadata
    const options = {
        pinataMetadata: {
            name: `${badge.name}-${level}.meta`
        },
        pinataOptions: {
            cidVersion: 0
        }
    };
    const res = await pinata.pinJSONToIPFS(metadata, options);
    const cid = res.IpfsHash;
    await doTransaction(async (session) => {
        // 更新metadata_url
        await Badges.updateOne({id: badge_id}, {
            [`series.${level}.metadata_ipfs_hash`]: `ipfs://${cid}`,
        }, {session});
        // 添加元信息
        await IpfsMetadata.updateOne(
            {ipfs_hash: `ipfs://${cid}`},
            {
                $set: {
                    ipfs_access_url: `https://ipfs.io/ipfs/${cid}`,
                    metadata: metadata,
                },
                $setOnInsert: {
                    created_time: Date.now(),
                },
            },
            {upsert: true, session: session},
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