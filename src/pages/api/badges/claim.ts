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
  
  const { badge_id } = req.query;
  const badgeId = String(badge_id);
  if( !badgeId ){
    res.json(response.invalidParams());
    return;
  }
  const result = await claimTheBadge(userId,badgeId);
  res.json(response.success({
    result: result,
  }))
});

async function claimTheBadge( userId:string, badgeId:string):Promise<any>{  
  //查找目标徽章
  const badge = await UserBadges.findOne({user_id: userId,badge_id: badgeId});
  
  //更新领取时间
  let result;
  const now = Date.now();
  for( let c of badge.series.keys() ){
      if( badge.series.get(c).claimed_time == null ) {
        result = await UserBadges.updateOne({user_id: userId,badge_id: badgeId},
          {series:{[c]: { obtained_time:badge.series.get(c).obtained_time,claimed_time:now }},
            updated_time:now});
        console.log(result);
      }
  }

  //若该徽章已经领取
  if( !result ){
     result = "Badge already claimed";
  } else {
    result = "Badge claimed success";
  }

  return result;
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