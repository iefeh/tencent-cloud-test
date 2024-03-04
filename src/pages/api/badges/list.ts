import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserBadges from "@/lib/models/UserBadges";
import Badges from "@/lib/models/Badge";
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
  
  //查询该用户的所有徽章
  const {page_num, page_size} = req.query;

  if (!page_num || !page_size) {
    res.json(response.invalidParams());
    return
  }

  const pageNum = Number(page_num);
  const pageSize = Number(page_size);
 
  const badges = await loadBadges(userId,pageNum,pageSize);

  //返回用户徽章
  res.json(response.success({
    total: badges[0].data.length,
    badges: badges[0].data
  }));
});

export async function loadBadges(userId:string, pageNum:number, pageSize:number): Promise<any[]> {
    const skip = (pageNum - 1) * pageSize;

    const aggregateQuery: PipelineStage[] = [
      {
          $match: {
              'user_id': userId,
          }
      },
      {
          $sort: {
              // 按照'order'升序排序
              'order': 1
          }
      },
      {
          $project: {
              '_id': 0,
          }
      },{
        $facet: {
            data: [{$skip: skip}, {$limit: pageSize}]
        }
    }
  ];

  const badges = await UserBadges.aggregate(aggregateQuery);

  // for( let c of badges ){
  //     //查询徽章配置
  //     let b = await Badges.find({id: c.badge_id});
  //     //取出用户取的和徽章系列
  //     let k = Object.keys(c.series)[0];
  //     //添加徽章的信息
  //     let t = b[0].series.get(k);
  //     c.description = t.description;
  //     c.icon_url = t.icon_url;
  //     c.image_url = t.image_url;
  // }


  return badges;
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