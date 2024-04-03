import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import { getCurrentBattleSeasonId } from '@/lib/battlepass/battlepass';
import { isPremiumSatisfied } from '@/lib/battlepass/battlepass';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const user_id = req.userId;
  const userId = String(user_id);

  let result: boolean = true;
  const season_id = await getCurrentBattleSeasonId();
  const is_premium = await isPremiumSatisfied(userId);
  //创建通证
  await UserBattlePassSeasons.insertMany([
    {
      "user_id": user_id,
      "battlepass_season_id": season_id,
      "finished_tasks": 0,
      "max_lv": 0,
      "reward_records": {
        "standard": {},
        "premium": {}
      },
      "total_moon_beam": 0,
      "created_time": Date.now(),
      "updated_time": Date.now()
    }
  ]).catch((error: Error) => {
    console.log(error);
    result = false;
  });
  res.json(
    response.success({
      is_premium: is_premium,
      success: result
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
