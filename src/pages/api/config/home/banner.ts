import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { UserContextRequest } from '@/lib/middleware/auth';
import HomeBanner from '@/lib/models/HomeBanner';

const router = createRouter<UserContextRequest, NextApiResponse>();
let banner: any[] = [];
let homeBannerRefreshTime: number = 0;

export const queryBanner = async () => {
  const now = Date.now();
  console.log('queryBanner start:', now);
  if (now - homeBannerRefreshTime < 60 * 1000) return banner;

  console.log('queryBanner find start:', now);
  try {
    const items = await HomeBanner.find(
      { active: true, start_time: { $lte: now }, end_time: { $gte: now } },
      { _id: 0, active: 0, start_time: 0, end_time: 0 },
      { sort: { order: 1 } },
    )
      .lean()
      .exec();
    console.log('queryBanner find end:', Date.now() - now);
    banner = items;
    homeBannerRefreshTime = now;
    return banner;
  } catch (error) {
    console.log('queryBanner error:', error);
    return [];
  }
};

router.get(async (req, res) => {
  const result = await queryBanner();
  return res.json(response.success(result));
});

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
