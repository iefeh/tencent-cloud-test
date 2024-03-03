import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserBadges from "@/lib/models/UserBadges";


const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const userId = req.userId;
  //判断用户是否登录
  if (!userId) {
    res.json(response.unauthorized());
    return;
  }
  
  let { badge_id } = req.query;
  const badgeId = String(badge_id);
  if( !badgeId ){
      return;
  }
  const result = await claimTheBadge(userId,badgeId);

});

async function claimTheBadge( userId:string, badgeId:string):Promise<string>{
  const serie = "";
  UserBadges.updateOne({user_id: userId,badge_id:badgeId},)
  
  return "";
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