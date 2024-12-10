import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { CallbackTaskType, upsertCallbackTaskOverview } from '@/lib/models/CallbackTaskOverview';
import { queryUserId } from '@/lib/freyr/userQuery';
import { ThinkingDataQuery } from '@/lib/quests/types';
import axios from 'axios';
const { parse } = require('csv-parse/sync');
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
    const userId = await queryUserId(email, address);
    if (userId === '') {
      res.json(
        response.success({
          completed: false,
          msg: 'User not found.',
        }),
      );
      return;
    }

    const thinkingDataQuery = {
      sql_template: `SELECT COUNT(*)>=1,COUNT(*) ,1 from ta.v_event_12 WHERE "$part_date" > '2024-12-10' AND "#event_name" = 'game_end' AND "account" = '{userId}'`,
      url: 'goldminer.moonveil.gg',
    } as ThinkingDataQuery;

    const result = await checkUserQuestFromThinkingData(thinkingDataQuery, userId);
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

async function checkUserQuestFromThinkingData(questProp: ThinkingDataQuery, userId: string): Promise<any> {
  const serverURL = 'http://13.212.32.231:8992/querySql';
  // 创建查询参数
  const params = new URLSearchParams({
    token: process.env.THINKINGDATA_API_TOKEN!,
    format: 'csv_header',
    timeoutSeconds: '15',
    sql: questProp.sql_template.replace('{userId}', userId),
  });

  try {
    // 发送POST请求
    const response = await axios.post(`${serverURL}?${params.toString()}`, null, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // 读取响应
    const body = response.data;
    if (body && !body.includes('_col0')) {
      console.error('Error:', body);
      return false;
    }
    // 解析CSV响应
    const records = parse(body, {
      skip_empty_lines: true,
    });

    return records;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

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
