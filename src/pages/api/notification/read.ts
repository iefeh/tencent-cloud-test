import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import NotificationReadFlag from '@/lib/models/NotificationReadFlag';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
  const userId = req.userId;
  const { notification_id } = req.body;

  if (!userId) {
    res.json(response.unauthorized());
    return;
  }
  let result: boolean = true;
  if (notification_id !== undefined) {
    //插入已读数据
    await NotificationReadFlag.insertMany([
      { user_id: userId, notification_id: notification_id, created_time: Date.now() },
    ]).catch((error: Error) => {
      console.log(error);
      result = false;
    });
  } else {
    res.json(response.invalidParams());
    return;
  }

  //返回结果
  res.json(
    response.success({
      success: result,
    }),
  );
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
