import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { PipelineStage } from 'mongoose';
import UserNotification from "@/lib/models/UserNotifications";

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
  res.json(response.success({
    total: data.length,
    data: data
  }));
});

async function getUserNotifications(userId: string, pageNum: number, pageSize: number): Promise<any[]> {
  const skip = (pageNum - 1) * pageSize;
  const pipeline: PipelineStage[] = [
    {
      $match: {
        user_id: userId
      },
    },
    {
      $lookup: {
        from: 'notifications',
        let: { id: '$notification_id' },
        as: 'notifictions',
        pipeline: [
          {
            $match: { $expr: { $and: [{ $eq: ['$id', '$$id'] }] } }
          }
        ]
      }
    },
    {
      $unwind: '$notifictions'
    },
    {
      $project: {
        _id: 0,
        userId: 1,
        notification_id: 1,
        readed: 1,
        content: "$notifictions.content",
        link: "$notifictions.link",
        created_time: 1
      }
    },
    {
      $sort: {
        created_time: -1
      }
    }
  ];
  let data: any[] = await UserNotification.aggregate(pipeline);
  return data;
}

// this will run if none of the above matches
router.all((req, res) => {
  res.status(405).json({
    error: "Method not allowed",
  });
});

export default router.handler({
  onError(err, req, res) {
    console.error(err);
    res.status(500).json(response.serverError());
  },
});