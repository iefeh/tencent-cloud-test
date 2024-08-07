import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import UserTelegram from '@/lib/models/UserTelegram';
import User from '@/lib/models/User';
import * as Sentry from '@sentry/nextjs';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  const telegram_id = req.query.telegram_id as string;
  if (!telegram_id) {
    res.json(response.invalidParams());
    return;
  }

  try {
    const userTelegram = await UserTelegram.findOne({ telegram_id: telegram_id, deleted_time: null });
    if (!userTelegram) {
      res.json(response.notFound());
      return;
    }

    const user = await User.findOne({ user_id: userTelegram.user_id, deleted_time: null });
    if (!user) {
      throw new Error('User not found but Telegram user found');
    }

    res.json(
      response.success({
        username: user.username,
        invite_code: user.invite_code,
      }),
    );
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    res.status(500).json(response.serverError());
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
