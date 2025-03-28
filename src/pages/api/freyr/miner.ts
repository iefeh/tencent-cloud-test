import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { CallbackTaskType, upsertCallbackTaskOverview } from '@/lib/models/CallbackTaskOverview';
import { queryUserId, checkUserQuestFromThinkingData } from '@/lib/freyr/userQuery';
import * as Sentry from '@sentry/nextjs';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  let { email, address } = req.query;
  if (!email || email === '' || (Array.isArray(email) && email.length === 0)) {
    // 本API所有报错均返回200，completed = false，并提供相应信息，下同
    res.json(
      response.success({
        completed: false,
        msg: 'Parameter email is missing.',
      }),
    );
    return;
  }

  if (Array.isArray(email)) {
    email = email[0];
  }

  if (Array.isArray(address)) {
    if (address.length > 0) {
      address = address[0];
    } else {
      address = '';
    }
  } else if (address === undefined) {
    address = '';
  }

  try {
    const userId = await queryUserId(email, '', '', address);
    if (userId === '') {
      res.json(
        response.success({
          completed: false,
          msg: 'User not found.',
        }),
      );
      return;
    }

    const sql = `SELECT COUNT(*)>=1,COUNT(*) ,1 from ta.v_event_12 WHERE "$part_date" > '2024-12-10' AND "#event_name" = 'game_end' AND "account" = '${userId}'`;

    const result = await checkUserQuestFromThinkingData(sql);
    if (!result || !result[1]) {
      // 本API在内部报错时直接返回false而不是500
      res.json(
        response.success({
          completed: false,
        }),
      );
      return;
    }

    const s = result[1][0];
    const completed = s === 'true';

    // upsert CallbackTaskOverview
    await upsertCallbackTaskOverview(userId, CallbackTaskType.FREYR_PLAY_MINER, completed);

    res.json(
      response.success({
        completed: completed,
      }),
    );
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);

    // 本API在内部报错时直接返回false而不是500
    res.json(
      response.success({
        completed: false,
      }),
    );
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
