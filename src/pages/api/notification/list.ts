import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { PipelineStage } from 'mongoose';
import UserNotification from '@/lib/models/UserNotifications';
import GlobalNotification from '@/lib/models/GlobalNotification';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const userId = req.userId;
  const { page_num, page_size } = req.query;

  let pageNum = Number(page_num);
  let pageSize = Number(page_size);
  if (!pageNum) {
    //若没有传页数和单页条数，则赋默认值
    pageNum = 1;
  }
  if (!pageSize) {
    //若没有传页数和单页条数，则赋默认值
    pageSize = 10;
  }

  const data: any[] = await getUserNotifications(String(userId), pageNum, pageSize);
  if (data[0].metadata.length == 0 || data[0].metadata[0].total == 0) {
    data[0].metadata[0] = { total: 0 };
    data[0].data = [];
  }

  let has_unread: boolean = false;
  for (let i of data[0].data) {
    if (!i.readed) {
      has_unread = !i.readed;
      break;
    }
  }

  res.json(
    response.success({
      total: data[0].metadata[0].total,
      has_unread: has_unread,
      data: data[0].data,
    }),
  );
});

async function getUserNotifications(userId: string, pageNum: number, pageSize: number): Promise<any[]> {
  const skip = (pageNum - 1) * pageSize;
  const now = Date.now();
  const pipeline: PipelineStage[] = [
    {
      $match: {
        user_id: userId,
        created_time: { $lt: now }
      },
    },
    {
      $unionWith: {
        coll: 'global_notifications',
        pipeline: [
          {
            $match: {
              created_time: { $lt: now },
              $or: [{ template_notification: { $exists: false } }, { template_notification: false }]
            },
          },
        ],
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
        content: 1,
        link: 1,
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
      $sort: {
        created_time: -1,
      },
    },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: pageSize }],
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
