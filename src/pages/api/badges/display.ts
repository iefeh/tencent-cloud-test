import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Badges from "@/lib/models/Badge";
import UserBadges from "@/lib/models/UserBadges";
import { BadgeSeries } from "../../../lib/models/Badge";
import {PipelineStage} from 'mongoose';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
  let userId = req.userId;
  userId = "4fa8b6f9-d296-4e63-af85-19ce2d9c2cfa";
  //判断用户是否登录
  if (!userId) {
    res.json(response.unauthorized());
    return;
  }

  const result = await getUserDisplayedBadges(userId);
  


  res.json(response.success({
    result: result,
  }));
});
async function getUserDisplayedBadges(userId:string): Promise<any[]> {
  const aggregateQuery: PipelineStage[] = [
    {
        $match: {
            'user_id': userId,
            'display': true,
        }
    },
    {
        $sort: {
            // 按照'order'升序排序
            'display_order': 1
        }
    },
    {
        $project: {
            '_id': 0,
            'created_time': 0,
            'updated_time': 0,
            'order': 0        
        }
    },{
      $facet: {
        data: [{$limit: 5}]
      }
    }
  ];

  let result = await UserBadges.aggregate(aggregateQuery);
  for( let c of result[0].data ) {
    

    const badges = await Badges.find({id: c.badge_id});
    let maxLv = -1;
    for( let s of Object.keys(c.series) ) {
      if( Number(s) > maxLv && c.series[s].claimed_time != null ){
        maxLv = Number(s);
      }
    }
    console.log("maxLv: "+maxLv);
    c.lv = maxLv;
    c.name = badges[0].name;
    c.icon_url = badges[0].series.get(String(maxLv)).icon_url;
    c.image_url = badges[0].series.get(String(maxLv)).image_url;
    c.description = badges[0].series.get(String(maxLv)).description;
    delete c.series;
  }
  //const badges = await Badges.find({id: badgeId});
  return result;
}

//获取该徽章下最高等级的奖章
export async function getMaxLevelBadge(badgeId:string): Promise<any> {
  const badges = await Badges.find({id: badgeId});
  //判断是否有徽章
  if (badges.length == 0 ) {
    return { description: '', image_url: '', open_for_mint: false, requirements: [], icon_url: ""};
  }

  //获取最高等级的徽章
  let maxLevel: number | string ;
  maxLevel=Number.MIN_VALUE;
  for ( let c of badges[0].series.keys() ) {
    if ( Number(c) > maxLevel ) {
      maxLevel = Number(c);
    }
  }
  maxLevel = String(maxLevel);
  badges[0].series.get(maxLevel).name = badges[0].name;
  return badges[0].series.get(maxLevel);
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