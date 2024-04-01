import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import { getCurrentBattleSeasonId } from './overview';
import UserMetrics from '@/lib/models/UserMetrics';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const user_id = req.userId;
  const userId = String(user_id);

  //将用户通行证由低阶切换至高阶
  let success: boolean = true;
  let msg: string = "";
  const user_metric = await UserMetrics.findOne({ user_id: userId });
  const satisfied: boolean = await isPremiumSatisfied(userId);
  if (satisfied) {
    const season_id = await getCurrentBattleSeasonId();
    await UserBattlePassSeasons.updateOne({ user_id: userId, battlepass_season_id: season_id }, { type: BattlePassType.PremiumPass, updated_time: Date.now() }).catch((error: Error) => {
      console.log(error);
      msg = "Update failed."
      success = false;
    });
  } else {
    msg = "Didn't hold tetra nft."
    success = false;
  }

  res.json(
    response.success({
      msg: msg,
      success: success
    }),
  );
});

export async function isPremiumSatisfied(user_id: string): Promise<boolean> {
  const user_metric: any = await UserMetrics.findOne({ user_id: user_id });
  let satisfied: boolean = false;
  if(user_metric){
    if (Number(user_metric.tetra_holder) === 1) {
      satisfied = true;
    }
  }
  
  return satisfied;
}
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
