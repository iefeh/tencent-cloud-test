import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import { getCurrentBattleSeason, getCurrentBattleSeasonId } from '@/lib/battlepass/battlepass';
import { isPremiumSatisfied } from '@/lib/battlepass/battlepass';
import { getUserTasksOverviewRawInfo } from './tasks_overview';
import { sendBattlepassCheckMessage } from '@/lib/kafka/client';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const user_id = req.userId;
  const userId = String(user_id);

  let result: boolean = true;
  const season = await getCurrentBattleSeason();

  //创建通证
  await UserBattlePassSeasons.insertMany([
    {
      "user_id": user_id,
      "battlepass_season_id": season.id,
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

  const is_premium = await isPremiumSatisfied(userId);

  //创建新通证成功时才检测
  if (result) {
    const finishedTasks: number = await getFinishedTasks(userId);
    //判断用户已完成的任务数是否已达标
    let updateDoc: any = {};
    let now: number = Date.now();
    for (let lv of season.standard_pass.keys()) {
      if (season.standard_pass.get(lv).task_line > finishedTasks) {
        break;
      } else {
        updateDoc[`max_lv`] = Number(lv);
        if (is_premium) {
          updateDoc[`reward_records.premium.${lv}.satisfied_time`] = now;
        }
        updateDoc[`reward_records.standard.${lv}.satisfied_time`] = now;
      }
    }
    //判断是否需要下发奖励
    if (finishedTasks > 0) {
      updateDoc[`finished_tasks`] = finishedTasks;
      updateDoc[`updated_time`] = now;
      await UserBattlePassSeasons.updateOne({ "user_id": user_id, "battlepass_season_id": season.id }, updateDoc);
    }
  }

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
      console.log(q.achieve_count);
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
