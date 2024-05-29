import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import Badges, { BadgeSeries, IBadges } from '@/lib/models/Badge';
import UserBadges, { IUserBadges, UserBadgeSeries } from '@/lib/models/UserBadges';
import UserMetrics from '@/lib/models/UserMetrics';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const userMetric = await UserMetrics.findOne({ user_id: req.userId });
  const luckyDrawBadgeId = process.env.LUCKY_DRAW_BADGE_ID;

  const luckyDrawBadge = await Badges.findOne({ id: luckyDrawBadgeId, deleted_time: null }, { _id: 0, name: 1, id: 1, obtain_url: 1, series: 1 }) as IBadges;
  const userBadge = await UserBadges.findOne({ user_id: req.userId, badge_id: luckyDrawBadgeId }, { _id: 0, badge_id: 1, series: 1 }) as IUserBadges;
  let series: any[] = [];
  luckyDrawBadge.series.forEach((value: BadgeSeries, level: string) => {
    series.push({
      lv: Number(level),
      description: value.description,
      icon_url: value.icon_url,
      image_url: value.image_url,
      requirements: value.requirements.length > 0 ? value.requirements[0].properties.value : 0,
      obtained: false,
      claimed: false,
      claimed_time: null,
      obtained_time: null,
    })
  });
  series.sort((a, b) => a.lv - b.lv);
  let maxLevelObtained = 0;
  if (userBadge) {
    maxLevelObtained = Math.max(...Array.from(userBadge.series.keys()).map(level => Number(level)));
    series.map(series => {
      if (series.lv < maxLevelObtained) {
        series.obtained = true;
        series.obtained_time = userBadge.series.get(String(series.lv))?.obtained_time
        series.claimed = true;
        series.claimed_time = userBadge.series.get(String(series.lv))?.claimed_time
      }
      if (series.lv === maxLevelObtained) {
        series.obtained = true;
        series.obtained_time = userBadge.series.get(String(maxLevelObtained))?.obtained_time
        series.claimed = !!userBadge.series.get(String(maxLevelObtained))?.claimed_time;
        series.claimed_time = series.claimed ? userBadge.series.get(String(maxLevelObtained))?.claimed_time: null;
      }
    });
  }
  res.json(response.success({ 
    total_draw_amount: userMetric.total_lottery_draw_amount | 0,
    luckyDrawBadge: {
      badge_id: luckyDrawBadge.id,
      name: luckyDrawBadge.name,
      decription: luckyDrawBadge.description,
      obtain_url: luckyDrawBadge.obtain_url,
      active: luckyDrawBadge.active,
      max_level_obtained: maxLevelObtained,
      update_time: luckyDrawBadge.updated_time,
      series: series
    }
  }));
});

// this will run if none of the above matches
router.all((req, res) => {
  res.status(405).json({
    error: 'Method not allowed',
  });
});

export default router.handler({
  onError(err, req, res) {
    console.error(err);
    res.status(500).json(response.serverError());
  },
});