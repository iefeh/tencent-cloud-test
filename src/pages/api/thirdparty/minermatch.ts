import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import logger from '@/lib/logger/winstonLogger';
import { UserContextRequest } from '@/lib/middleware/auth';
import { CallbackTaskType, upsertCallbackTaskOverview } from '@/lib/models/CallbackTaskOverview';
import { errorInterceptor } from '@/lib/middleware/error';
import * as response from '@/lib/response/response';
import * as Sentry from '@sentry/nextjs';

import { queryUserId, checkUserQuestFromThinkingData, convertErrorResponse } from '@/lib/freyr/userQuery';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor()).post(async (req, res) => {
  const { email, twitter, discord, address, start_time, end_time } = req.body;
  const startTime = Number(start_time);
  const endTime = Number(end_time);
  if ((!email && !twitter && !discord && !address) || !startTime || !endTime) {
    return res.json(response.success({ error: convertErrorResponse(response.invalidParams()) }));
  }

  try {
    const startDate = new Date(startTime).toISOString().slice(0, 10);
    const endDate = new Date(endTime + 86400000).toISOString().slice(0, 10);
    const userId = await queryUserId(email, twitter, discord, address);
    if (!userId) {
      return res.json(response.success({ error: convertErrorResponse(response.notFound()) }));
    }

    const sql = `SELECT  count("#event_name") >= 10,count("#event_name"),10 FROM  ta.v_event_12 WHERE ("$part_date" BETWEEN '${startDate}' AND '${endDate}') AND "#event_name" = 'game_end' AND "account" = '${userId}'`;

    const result = await checkUserQuestFromThinkingData(sql);
    if (!result || !result[1]) {
      // 本API在内部报错时直接返回false而不是500
      return res.json(response.success({ error: convertErrorResponse(response.serverError()) }));
    }

    const s = result[1][0];
    const achieved = s === 'true';

    // upsert CallbackTaskOverview
    await upsertCallbackTaskOverview(userId, CallbackTaskType.MINER_MATCH_PLAY, achieved);

    return res.json(response.success({ result: { achieved: achieved } }));
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    return res.json(response.success({ error: convertErrorResponse(response.serverError()) }));
  }
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
