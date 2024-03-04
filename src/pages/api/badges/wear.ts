import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserBadges from "@/lib/models/UserBadges";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
  let userId = req.userId;
  userId = "4fa8b6f9-d296-4e63-af85-19ce2d9c2cfa";
  //判断用户是否登录
  if (!userId) {
    res.json(response.unauthorized());
    return;
  }
  
  //保存背包展示信息
  const { badge_id,display,order } = req.query;
  const result = await UserBadges.updateOne({user_id:userId, badge_id:badge_id},
      {
          $set: {
            display: display,
            order: order,
            updated_time: Date.now(),
          }
      } 
  );
  
  res.json(response.success({
      modifiedCount: result.modifiedCount
    }
  ))
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