import type { NextApiResponse } from "next";
import { createRouter } from 'next-connect';

import { maybeAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import News from '@/lib/models/News';
import NewsMetrics from '@/lib/models/NewsMetrics';
import { isDuplicateKeyError } from '@/lib/mongodb/client';
import * as response from '@/lib/response/response';
import * as Sentry from '@sentry/nextjs';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor, errorInterceptor()).post(async (req, res) => {
    const { id } = req.body;
    if (!id) {
        res.json(response.invalidParams());
        return
    }
    const userId = req.userId!;
    // 如果用户已登录, 则记录用户分享行为
    if (userId) {
        // 查询文章
        const news: any = await News.findOne({ id: id, is_published: true, deleted_time: null }).lean();
        if (!news) {
            res.json(response.notFound("Unknown news."));
            return;
        }
        const likeResult = await shareNews(userId, id);
        if (!likeResult) {
            res.json(response.serverError());
            return;
        } else {
            res.json(response.success());
            return;
        }
    } else {
        res.json(response.success());
        return;
    }
});

async function shareNews(userId: string, news_id: string): Promise<boolean> {
    try {
        const result = await NewsMetrics.updateOne(
            { news_id: news_id, user_id: userId, share_flag: false },
            { $set: { share_flag: true } },
            { upsert: true }
        );
        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
            await News.updateOne({ id: news_id }, { $inc: { share_count: 1 } });
        }
        return true
    } catch (error) {
        console.error(error);
        if (isDuplicateKeyError(error)) {
            return true;
        }
        Sentry.captureException(error);
        return false;
    }
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
