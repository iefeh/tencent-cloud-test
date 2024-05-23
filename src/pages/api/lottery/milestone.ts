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
      level: Number(level),
      description: value.description,
      icon_url: value.icon_url,
      image_url: value.image_url,
      requirements: value.requirements.length > 0 ? value.requirements[0].properties.value : 0,
      obtained: false,
      claimed: false
    })
  });
  series.sort((a, b) => a.level - b.level);
  if (userBadge) {
    const maxLevelObtained = Math.max(...Array.from(userBadge.series.keys()).map(level => Number(level)));
    series.map(series => {
      if (series.level < maxLevelObtained) {
        series.obtained = true;
        series.claimed = true;
      }
      if (series.level === maxLevelObtained) {
        series.obtained = true;
        series.claimed = !!userBadge.series.get(String(maxLevelObtained))?.claimed_time;
      }
    });
  }
  res.json(response.success({ 
    total_draw_amount: userMetric.total_lottery_draw_amount | 0,
    luckyDrawBadge: {
      id: luckyDrawBadge.id,
      name: luckyDrawBadge.name,
      obtain_url: luckyDrawBadge.obtain_url,
      decription: luckyDrawBadge.description,
      active: luckyDrawBadge.active,
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