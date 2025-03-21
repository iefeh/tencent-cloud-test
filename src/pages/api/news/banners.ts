import type { NextApiResponse } from 'next';
import { PipelineStage } from 'mongoose';
import { createRouter } from 'next-connect';

import { UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import NewsBanner from '@/lib/models/NewsBanner';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor()).get(async (req, res) => {
    const banners = await getBanners();
    return res.json(response.success(banners));
});

async function getBanners(): Promise<any[]> {
    const aggregateQuery: PipelineStage[] = [
        {
            $match: {
                is_published: true,
                deleted_time: null,
            }
        },
        {
          $sort: {
            // 按照序号排序
            order: 1,
          },
        },
        {
            $project: {
                _id: 0,
                id: 1,
                news_id: 1,
                cover_url: 1,
            },
        },
        {
            $lookup: {
                from: 'news',
                localField: 'news_id',
                foreignField: 'id',
                as: 'news',
                pipeline: [{
                    $project: {
                        _id: 0,
                        type: 1,
                        tags: 1,
                        title: 1,
                        summary: 1,
                    },
                }]
            },
        },
        {
            $unwind: "$news",
        }
    ];
    let data = await NewsBanner.aggregate(aggregateQuery);
    return data;
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
