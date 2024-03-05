import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserBadges from "@/lib/models/UserBadges";
import doTransaction from "@/lib/mongodb/transaction";
import { letterSpacing } from "html2canvas/dist/types/css/property-descriptors/letter-spacing";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).post(async (req, res) => {
  let userId = req.userId;
  userId = "4fa8b6f9-d296-4e63-af85-19ce2d9c2cfa";
  //判断用户是否登录
  if (!userId) {
    res.json(response.unauthorized());
    return;
  }

  const { badge_id,display }  = req.query;

  if(!badge_id || !display) {
    res.json(response.invalidParams());
    return;
  }
  //保存所有徽章的穿戴信息
  const result = await saveDisplayBadge( userId,String(badge_id),String(display) );
  if ( result.modifiedCount == 0) {
    res.json(response.invalidParams({
      modifiedCount: result.modifiedCount,
      msg: result.msg
      }
    ));
    return;
  }


  res.json(response.success({
      modifiedCount: result.modifiedCount,
      msg: result.msg
    }
  ));
});

async function saveDisplayBadge(userId:string, badgeId:string,display:string):Promise<any> {
    if ( display == 'true' ) {
      const displayedBadges = await UserBadges.find({user_id: userId,display: true});
      let result:any = {};
      if ( displayedBadges.length >= 5 ) {
        result.msg = "no place to display badge.";
        result.modifiedCount = 0;
        return result;
      }
    }
    
    
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