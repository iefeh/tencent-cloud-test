import type { NextApiResponse } from "next";
import { createRouter } from 'next-connect';

import { errorInterceptor } from '@/lib/middleware/error';
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import News from '@/lib/models/News';
import NewsMetrics from "@/lib/models/NewsMetrics";
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor, errorInterceptor()).get(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    res.json(response.invalidParams());
    return
  }
  const userId = req.userId!;
  // 查询文章详情
  const news: any = await News.findOne({ id: id, is_published: true, deleted_time: null }, {
    _id: 0,
    id: 1,
    type: 1,
    tags: 1,
    title: 1,
    summary: 1,
    cover_url: 1,
    content: 1,
    updated_time: 1
  }).lean();
  if (!news) {
    res.json(response.notFound("Unknown news."));
    return;
  }
  await News.updateOne({ id: id }, { $inc: { view_count: 1 } });
  await enrichNews(userId, news);
  res.json(response.success({
    news: news,
  }));
});

async function enrichNews(userId: string, news: any) {
  if (!userId) {
    news.like = false;
    news.share = false;
  } else {
    const metrics = await NewsMetrics.findOne({ news_id: news.id, user_id: userId });
    news.like = metrics?.like_flag || false;
    news.share = metrics?.share_flag || false;
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
