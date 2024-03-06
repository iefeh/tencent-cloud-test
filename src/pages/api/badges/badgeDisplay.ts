import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserBadges from "@/lib/models/UserBadges";
import doTransaction from "@/lib/mongodb/transaction";
import { letterSpacing } from "html2canvas/dist/types/css/property-descriptors/letter-spacing";

const router = createRouter<UserContextRequest, NextApiResponse>();
const badgeDisplayLimit = 5;

router.use(maybeAuthInterceptor).post(async (req, res) => {
  let userId = req.userId;
  userId = "4fa8b6f9-d296-4e63-af85-19ce2d9c2cfa";
  //判断用户是否登录
  if (!userId) {
    res.json(response.unauthorized());
    return;
  }

  const { badge_id,display } = req.body;

  if(!badge_id || typeof display !== 'boolean') {
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
    let result:any = {};

    if ( display == 'true' ) {
      const displayedBadges = await UserBadges.find({user_id: userId,display: true});

      if ( displayedBadges.length >= badgeDisplayLimit ) {
        result.modifiedCount = 0;
        result.msg = "no place to display badge.";
        return result;
      }

      let sorts: Map<number, number> = new Map();
   
      for( let b of displayedBadges ) {
         sorts.set(b.display_order,1);
      }
      
      for( let i=1;i<=badgeDisplayLimit; i++ ) {
       if( !sorts.has(i)) {
        let t = await UserBadges.updateOne({user_id: userId, badge_id: badgeId}, {display: true, display_order: i, updated_time: Date.now()});
        result.modifiedCount = t.modifiedCount;
        result.msg = "operate success.";
        break;
       }
      }

      return result;
    }
    
    let t = await UserBadges.updateOne({user_id: userId, badge_id: badgeId},{display: false, updated_time: Date.now()});
    result.modifiedCount = t.modifiedCount;
    result.msg = "operate success.";
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