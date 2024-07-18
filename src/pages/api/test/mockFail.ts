import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import logger from '@/lib/logger/winstonLogger';
import {
    constructVerifyResponse
} from '@/lib/lottery/lottery';
import { UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import * as response from '@/lib/response/response';
import * as Sentry from '@sentry/nextjs';

const defaultErrorResponse = response.success(constructVerifyResponse(false, "Network busy, please try again later."));

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor()).post(async (req, res) => {
  const { email, twitter, discord, address, start_time, end_time } = req.body;
  console.log(`email: ${email}, twitter: ${twitter}, discord: ${discord}, address: ${address}, start: ${start_time}, end: ${end_time}`);
  try {
    return res.json(response.success({result: { achieved: false }}));
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    res.status(500).json(defaultErrorResponse);
    return;
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