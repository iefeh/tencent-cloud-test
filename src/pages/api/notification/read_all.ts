import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserNotification from '@/lib/models/UserNotifications';
import NotificationReadFlag from '@/lib/models/NotificationReadFlag';
import { PipelineStage } from 'mongoose';

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
    let unreadNotifications: any[] = await getUserUnreadNotifications(String(userId),String(notification_id));
    if (unreadNotifications.length > 0) {
      let target_time: number = 0;
      for (let n of unreadNotifications) {
        if (n.notification_id === notification_id) {
          target_time = n.created_time;
        }
      }
      if (target_time === 0) {
        res.json(response.invalidParams());
        return;
      }
      //组装已读数据
      let target_notifications: any[] = [];
      for (let n of unreadNotifications) {
        if (n.created_time <= target_time && !n.readed) {
          target_notifications.push({ user_id: userId, notification_id: n.notification_id, created_time: Date.now() });
        }
      }
      //插入已读数据
      await NotificationReadFlag.insertMany(target_notifications, { ordered: false }).catch((error: Error) => {
        console.log(error);
        result = false;
      });
    }
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

async function getUserUnreadNotifications(userId: string, notification_id: string): Promise<any[]> {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        user_id: userId,
      },
    },
    {
      $unionWith: {
        coll: 'global_notifications',
      },
    },
    {
      $lookup: {
        from: 'notification_read_flag',
        let: { notification_id: '$notification_id' },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ['$user_id', userId] }, { $eq: ['$notification_id', '$$notification_id'] }] },
            },
          },
        ],
        as: 'read_flag',
      },
    },
    {
      $project: {
        _id: 0,
        notification_id: 1,
        created_time: 1,
        readed: {
          $cond: {
            if: { $gt: [{ $size: '$read_flag' }, 0] },
            then: true, // 如果大于0，则输出true
            else: false, // 否则输出false
          },
        },
      },
    },
    {
      $match: {
        $or: [{ readed: false }, { notification_id: notification_id }],
      },
    },
  ];
  let data: any[] = await UserNotification.aggregate(pipeline);
  return data;
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
