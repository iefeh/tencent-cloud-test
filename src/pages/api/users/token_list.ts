import type { NextApiResponse } from "next";
import { PipelineStage } from 'mongoose';
import { createRouter } from 'next-connect';

import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserTokenReward, { UserTokenSourceType } from '@/lib/models/UserTokenReward';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    let { page_num, page_size, source_type } = req.query;
    if (!page_num || !page_size) {
        return res.json(response.invalidParams());
    }
    const pageNum = Number(page_num);
    const pageSize = Number(page_size);
    let sourceTypes: string[] = [ UserTokenSourceType.Quest ];
    const userId = req.userId!;
    const pagination = await paginationUserTokenHistory(pageNum, pageSize, userId, source_type as string);
    if (pagination.total == 0 || pagination.tokens.length == 0) {
        // 当前没有匹配的数据 
        return res.json(response.success({
            source_types: sourceTypes,
            current_source: source_type,
            total: pagination.total,
            page_num: pageNum,
            page_size: pageSize,
            items: pagination.tokens,
        }));
    }
    // 查询奖励细节
    const tokens = pagination.tokens;
    return res.json(response.success({
        source_types: sourceTypes,
        current_source: source_type,
        total: pagination.total,
        page_num: pageNum,
        page_size: pageSize,
        items: tokens,
    }));
});

// 查询MB数据
async function paginationUserTokenHistory(pageNum: number, pageSize: number, userId: string, sourceType?: string): Promise<{ total: number, tokens: any[] }> {
    let matchOpts: any = {
        user_id: userId,
        deleted_time: null,
        token_amount_raw: { $ne: 0 }
    };
    if (sourceType) {
        matchOpts.source_type = sourceType;
    }
    const skip = (pageNum - 1) * pageSize;

    const aggregateQuery: PipelineStage[] = [
        {
            $match: matchOpts
        },
        {
            $sort: {
                created_time: -1
            }
        },
        {
            $lookup: {
                from: 'tokens',
                let: { id: '$token_id' },
                as: "token",
                pipeline: [{
                    $match: { $expr: { $and: [{ $eq: ['$token_id', '$$id'] }] } }
                }]
            }
        }, 
        {
            $unwind: '$token'
        },
        {
            $project: {
                _id: 0,
                reward_id: 1,
                source_type: 1,
                "token.name": 1,
                "token.symbo": 1,
                "token.chain_id": 1,
                "token.address": 1,
                "token.icon": 1,
                token_amount_raw: 1,
                token_amount_formatted: 1,
                tx_hash: 1,
                created_time: 1,
                claimed_time: 1,
                status: 1
            }
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: pageSize }]
            }
        }
    ];
    const results = await UserTokenReward.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return { total: 0, tokens: [] }
    }
    return { total: results[0].metadata[0].total, tokens: results[0].data }
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