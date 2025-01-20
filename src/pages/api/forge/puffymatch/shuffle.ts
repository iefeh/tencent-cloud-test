import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

import logger from '@/lib/logger/winstonLogger';
import { UserContextRequest } from '@/lib/middleware/auth';
import { CallbackTaskType, upsertCallbackTaskOverview } from '@/lib/models/CallbackTaskOverview';
import { errorInterceptor } from '@/lib/middleware/error';
import * as response from '@/lib/response/response';
import * as Sentry from '@sentry/nextjs';

import { queryUserId, checkUserQuestFromThinkingData } from '@/lib/freyr/userQuery';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor()).post(async (req, res) => {
  const { email, twitter, start_time, end_time } = req.body;

  try {
    const startDate = new Date(Number(start_time)).toISOString().slice(0, 10);
    const endDate = new Date(Number(end_time) + 86400000).toISOString().slice(0, 10);
    const userId = await queryUserId(email, twitter, '', '');
    if (!userId) {
      return res.json(response.success({ error: response.notFound() }));
    }

    const sql = `SELECT COUNT(*)>=1,COUNT(*) ,1 from ta.v_event_14 WHERE ("$part_date" BETWEEN '${startDate}' AND '${endDate}') AND "#event_name" = 'use_item' AND "item_id" = 'shuffle' AND "account" = '${userId}'`;

    const result = await checkUserQuestFromThinkingData(sql);
    if (!result || !result[1]) {
      // 本API在内部报错时直接返回false而不是500
      return res.json(response.success({ error: response.serverError() }));
    }

    const s = result[1][0];
    const achieved = s === 'true';

    // upsert CallbackTaskOverview
    await upsertCallbackTaskOverview(userId, CallbackTaskType.FORGE_MATCH_SHUFFLE, achieved);

    return res.json(response.success({ result: { achieved: achieved } }));
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    return res.json(response.success({ error: response.serverError() }));
  }
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
