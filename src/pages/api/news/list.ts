import type { NextApiResponse } from 'next';
import { escapeRegExp } from 'lodash';
import { FilterQuery, PipelineStage } from 'mongoose';
import { createRouter } from 'next-connect';

import { UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import News from '@/lib/models/News';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor()).get(async (req, res) => {
    const page_num = +(req.query.page_num || 0);
    const page_size = +(req.query.page_size || 0);
    const { title, type, tags } = req.query;

    if (!page_num || !page_size) {
        return res.json(response.invalidParams({ message: 'Required parameter is missing.' }));
    }

    if (!!title && typeof title !== 'string') {
        return res.json(response.invalidParams({ messsage: 'Unsupported parameter of "title".' }));
    }

    if (!!type && typeof type !== 'string') {
        return res.json(response.invalidParams({ messsage: 'Unsupported parameter of "type".' }));
    }

    if (!!tags && !(tags instanceof Array) && typeof tags !== 'string') {
        return res.json(response.invalidParams({ messsage: 'Unsupported parameter of "tags".' }));
    }

    const data = await queryPaginatedNews(page_num, page_size, type, title, tags);
    return res.json(response.success(data));
});

async function queryPaginatedNews(pageNum: number, pageSize: number, type: string | null = null, title?: string, tags?: string | string[]): Promise<PageResDTO> {
    const skip = (pageNum - 1) * pageSize;
    const $match: FilterQuery<any> = { deleted_time: null, is_published: true };

    if (!!type) {
        $match.type = type;
    }
    if (!!title) {
        $match.title = { $regex: escapeRegExp(title) }
    };
    if (!!tags && tags?.length > 0) {
        $match.tags = { $all: tags instanceof Array ? tags : [tags] };
    }

    const aggregateQuery: PipelineStage[] = [
        {
            $match,
        },
        {
            $project: {
                _id: 0,
                id: 1,
                type: 1,
                tags: 1,
                cover_url: 1,
                title: 1,
                summary: 1,
            },
        },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [{ $skip: skip }, { $limit: pageSize }],
            },
        },
    ];

    const results = await News.aggregate(aggregateQuery);

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
