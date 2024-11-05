import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import GlobalNotification from "@/lib/models/GlobalNotification";
import UserNotifications from "@/lib/models/UserNotifications";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const userId = req.userId!;
  await createRewardNotification(userId);
  res.json(response.success());
});

export async function createRewardNotification(userId: string) {
  const temp = await GlobalNotification.findOne({ notification_id: "433c82ad-9f35-4740-b917-e05f489258d6" });
  const ut = new UserNotifications({ user_id: userId, notification_id: temp.notification_id, content: temp.content, link: temp.link, created_time: Date.now() });

  await ut.save().catch((error: any) => {
    console.log(error.message);
  });
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