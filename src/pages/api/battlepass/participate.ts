import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import { getCurrentBattleSeason, getCurrentBattleSeasonId } from '@/lib/battlepass/battlepass';
import { isPremiumSatisfied } from '@/lib/battlepass/battlepass';
import { getUserTasksOverviewRawInfo } from './tasks_overview';
import { sendBattlepassCheckMessage } from '@/lib/kafka/client';
import { errorInterceptor } from '@/lib/middleware/error';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const user_id = req.userId;
  const userId = String(user_id);

  let result: boolean = true;
  const season = await getCurrentBattleSeason();

  const is_premium = await isPremiumSatisfied(userId);

  //创建当前奖励信息
  let rewardRecords: any = {
    "standard": {},
    "premium": {}
  }

  //更新
  let maxLv: number = 0;
  let finishedTasks: number = await getFinishedTasks(userId);
  //判断用户已完成的任务数是否已达标
  let now: number = Date.now();
  if (finishedTasks > 0) {
    for (let lv of season.standard_pass.keys()) {
      if (season.standard_pass.get(lv).task_line > finishedTasks) {
        break;
      } else {
        maxLv = Number(lv);
        if (is_premium) {
          rewardRecords.premium[lv] = { satisfied_time: now };
        }
        rewardRecords.standard[lv] = { satisfied_time: now };
      }
    }
  }

  new UserBattlePassSeasons({
    "user_id": user_id,
    "battlepass_season_id": season.id,
    "finished_tasks": finishedTasks,
    "max_lv": maxLv,
    "reward_records": rewardRecords,
    "total_moon_beam": 0,
    "created_time": now,
    "updated_time": now
  }).save().catch((error: Error) => {
    console.log(error);
    result = false;
  });

  await isPremiumSatisfied(userId);

  res.json(
    response.success({
      is_premium: is_premium,
      success: result
    }),
  );
});

async function getFinishedTasks(userId: string): Promise<number> {
  let finishStatus = await getUserTasksOverviewRawInfo(userId);
  let achieveCount: number = 0;
  for (let c of finishStatus) {
    for (let q of c.quests) {
      if (q.achieve_count) {
        achieveCount++;
      }
    }
  }
  return achieveCount;
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
