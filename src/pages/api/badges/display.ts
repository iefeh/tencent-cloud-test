import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Badges from "@/lib/models/Badge";
import { BadgeSeries } from "../../../lib/models/Badge";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
  let {id} = req.query;
  if (!id) {
    res.json(response.invalidParams());
    return;
  }

  id = String(id);
  const targetBadge = await getMaxLevelBadge(id);

  if (!targetBadge.icon_url) {
    res.json(response.notFound());
    return;
  }

  res.json(response.success({
    description: targetBadge.description,
    icon_url: targetBadge.icon_url,
    image_image: targetBadge.image_url,
  }));
});

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