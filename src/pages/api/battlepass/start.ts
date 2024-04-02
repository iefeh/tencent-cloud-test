import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBattlePassSeasons from '@/lib/models/UserBattlePassSeasons';
import { getCurrentBattleSeasonId } from '@/lib/battlepass/battlepass';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const user_id = req.userId;
  const userId = String(user_id);
  //用户开始新的赛季
  let result: boolean = true;
  const season_id = await getCurrentBattleSeasonId();
  await UserBattlePassSeasons.updateOne({ user_id: userId, battlepass_season_id: season_id }, { started: true, updated_time: Date.now() }).catch((error: Error) => {
    console.log(error);
    result = false;
  });
  res.json(
    response.success({
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
