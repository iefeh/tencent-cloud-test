import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserNotification from '@/lib/models/UserNotifications';
import NotificationReadFlag from '@/lib/models/NotificationReadFlag';
import { PipelineStage } from 'mongoose';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const userId = req.userId;
  const { notification_id } = req.query;

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
    let unreadNotifications: any[] = await getUserUnreadNotifications(String(userId));
    if (unreadNotifications.length > 0) {
      //组装已读数据
      for (let n of unreadNotifications) {
        n.user_id = userId;
        n.created_time = Date.now();
        delete n.readed;
      }
      //插入已读数据
      await NotificationReadFlag.insertMany(unreadNotifications, { ordered: false }).catch((error: Error) => {
        console.log(error);
        result = false;
      });
    }
  }

  //返回结果
  res.json(
    response.success({
      success: result,
    }),
  );
});

async function getUserUnreadNotifications(userId: string): Promise<any[]> {
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
        readed: false,
      },
    },
  ];
  let data: any[] = await UserNotification.aggregate(pipeline);
  return data;
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
