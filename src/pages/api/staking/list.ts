import type { NextApiResponse } from 'next';
import { FilterQuery, PipelineStage } from 'mongoose';
import { createRouter } from 'next-connect';

import { UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import StakingEvent from '@/lib/models/StakingEvent';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor()).get(async (req, res) => {
    const page_num = +(req.query.page_num || 0);
    const page_size = +(req.query.page_size || 0);
    const start_time = +(req.query.start_time || 0);
    const end_time = +(req.query.end_time || 0);
    const { wallet_addr, type } = req.query;

    if (!page_num || !page_size || !wallet_addr) {
        return res.json(response.invalidParams({ message: 'Required parameter is missing.' }));
    }

    const data = await queryPaginatedStakingEvents(page_num, page_size, wallet_addr as string, type as string, start_time, end_time);
    return res.json(response.success(data));
});

async function queryPaginatedStakingEvents(pageNum: number, pageSize: number, wallet_addr: string, type?: string, start_time?: number, end_time?: number): Promise<PageResDTO> {
    const skip = (pageNum - 1) * pageSize;
    const $match: FilterQuery<any> = { user: wallet_addr };

    if (!!type) {
        $match.type = type;
    }
    if (!!start_time && !!end_time) {
        $match.tx_time = { $gte: start_time, $lte: end_time };
    };
    const aggregateQuery: PipelineStage[] = [
        {
            $match,
        },
        {
            $sort: {
                tx_time: -1
            }
        },
        {
            $project: {
                _id: 0,
                tx_hash: 1,
                type: 1,
                user: 1,
                amount: 1,
                reward_amount: 1,
                tx_time: 1,
            },
        },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [{ $skip: skip }, { $limit: pageSize }],
            },
        },
    ];

    const results = await StakingEvent.aggregate(aggregateQuery);

    const res = { total: 0, page_num: pageNum, page_size: pageSize, data: [] } as unknown as PageResDTO;
    if (results[0].metadata.length == 0) return res;

    res.total = results[0].metadata[0].total;
    res.data = results[0].data;
    return res;
}

// this will run if none of the above matches
router.all((req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
    }
    
    res.status(405).json({
        error: 'Method not allowed',
    });
});

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});
