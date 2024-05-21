import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import UserMetrics from '@/lib/models/UserMetrics';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const userMetric = await UserMetrics.findOne({ user_id: req.userId });
  res.json(response.success(userMetric.total_lottery_draw_amount | 0));
});

// this will run if none of the above matches
router.all((req, res) => {
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