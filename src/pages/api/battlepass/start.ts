import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import BattlePassSeasons  from '@/lib/models/BattlePassSeasons';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import UserMetrics from '@/lib/models/UserMetrics';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const user_id = req.userId;
  const userId = String(user_id);

  //获得当前赛季
  const now: number = Date.now();
  const current_season = await BattlePassSeasons.findOne({ start_time: { $lte: now }, end_time: { $gte: now } });
  if (!current_season) {
    res.json(response.notFound('season not found.'));
    return;
  }

  //是否已参与赛季
  const user_battle_season: any = await UserBattlePassSeasons.findOne({
    user_id: userId,
    battlepass_season_id: current_season.id,
  });

  let is_premium: boolean = false;
  if (user_battle_season) {
    is_premium = user_battle_season.type === BattlePassType.PremiumPass;
    res.json(
      response.success({
        started: user_battle_season.started,
        is_premium: is_premium,
        standard_pass:current_season.current_season
      }),
    );
    return;
  }
  const userMetric: any = await UserMetrics.findOne({ user_id: userId });
  
  if (userMetric) {
    is_premium = Boolean(userMetric.tetra_holder);
  }
  //是否为高阶通行证

  await UserBattlePassSeasons.insertMany([
    {
      user_id: userId,
      battlepass_season_id: current_season.id,
      finished_tasks: 0,
      max_lv: 0,
      type: is_premium ? BattlePassType.PremiumPass : BattlePassType.StandardPass,
      reward_records: null,
      total_moon_beam: 0,
      created_time: Date.now(),
      updated_time: Date.now(),
    },
  ]).catch((error: Error) => {
    console.log(error);
    res.json(response.serverError());
    return;
  });

  res.json(
    response.success({
      is_premium: is_premium,
    }),
  );
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
