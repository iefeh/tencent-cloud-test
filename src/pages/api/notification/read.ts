import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import UserNotification, { IUserNotification } from "@/lib/models/UserNotifications";
import { UpdateQuery } from 'mongoose';


const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const userId = req.userId;
  const { notification_id } = req.query;

  //修改提醒消息的状态
  const now = Date.now();
  const update: UpdateQuery<IUserNotification> = {
    readed: true,
    updated_time: now,
  };

  console.log(notification_id);

  let result: any;
  if (notification_id !== undefined) {
    result = await UserNotification.updateOne({ user_id: userId, notification_id: notification_id }, update);
  } else {
    result = await UserNotification.updateOne({ user_id: userId }, update);
  }

  //返回结果
  res.json(response.success({
    success: result.modifiedCount > 0
  }));
});
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