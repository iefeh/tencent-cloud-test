import type { NextApiResponse } from "next";
import { createRouter } from 'next-connect';

import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import News from '@/lib/models/News';
import NewsMetrics from '@/lib/models/NewsMetrics';
import { isDuplicateKeyError } from '@/lib/mongodb/client';
import * as response from '@/lib/response/response';
import * as Sentry from '@sentry/nextjs';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor, errorInterceptor()).post(async (req, res) => {
    const { id, like } = req.body;
    if (!id || !like) {
        res.json(response.invalidParams());
        return
    }
    const userId = req.userId!;
    // 查询文章
    const news: any = await News.findOne({ id: id, is_published: true, deleted_time: null }).lean();
    if (!news) {
        res.json(response.notFound("Unknown news."));
        return;
    }
    const likeResult = await likeNews(userId, id, like);
    if (!likeResult.success) {
        if (likeResult.isServerError) {
            res.json(response.serverError());
            return;
        } else {
            res.json(response.invalidParams({ message: like === 1 ? "News is already liked." : "News is not liked." }));
            return;
        }
    } else {
        res.json(response.success());
        return;
    }
});

async function likeNews(userId: string, news_id: string, like: number): Promise<{ success: boolean, isServerError: boolean }> {
    try {
        const result = await NewsMetrics.updateOne(
            { news_id: news_id, user_id: userId, like_flag: !(like === 1) },
            { $set: { like_flag: like === 1 } },
            { upsert: true });
        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
            return { success: false, isServerError: false };
        } else {
            await News.updateOne({ id: news_id }, { $inc: { like_count: like === 1 ? 1 : -1 } });
            return { success: true, isServerError: false };
        }
    } catch (error) {
        console.error(error);
        if (isDuplicateKeyError(error)) {
            return { success: false, isServerError: false };
        }
        Sentry.captureException(error);
        return { success: false, isServerError: true };
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
