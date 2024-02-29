import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Badges from "@/lib/models/Badge";
import { PipelineStage } from 'mongoose';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
  const {id} = req.query;
  if (!id) {
    res.json(response.invalidParams());
    return;
  }

  const badgeId = String(id);
  const query = {id: badgeId};

  const badges = await Badges.find(query);
  //判断是否有徽章
  if (badges.length == 0) {
    res.json(response.notFound());
    return;
  }

  //获取最高等级的徽章
  let maxLevel: number | string ;
  maxLevel=Number.MIN_VALUE;
  for (let c of badges[0].series.keys()) {
    if ( Number(c) > maxLevel ) {
      maxLevel = Number(c);
    }
  }

  maxLevel = String(maxLevel);
  res.json(response.success({
    description: badges[0].series.get(maxLevel).description,
    icon_url: badges[0].series.get(maxLevel).icon_url,
    image_image: badges[0].series.get(maxLevel).image_url,
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