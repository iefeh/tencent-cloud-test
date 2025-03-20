import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBattlePassSeasons from '@/lib/models/UserBattlePassSeasons';
import { getCurrentBattleSeason } from '@/lib/battlepass/battlepass';
import { isPremiumSatisfied } from '@/lib/battlepass/battlepass';
import { errorInterceptor } from '@/lib/middleware/error';
import { PipelineStage } from 'mongoose';
import QuestAchievement from '@/lib/models/QuestAchievement';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const user_id = req.userId;
  const userId = String(user_id);

  //获取当前赛季
  const season = await getCurrentBattleSeason();
  if (!season) {
    res.json(
      response.notFound({
        msg: "Battle season not found."
      }),
    );
    return;
  }
  //创建通证
  const result = await generateBattlepass(userId, season);

  res.json(
    response.success({
      is_premium: result.is_premium,
      success: result.success
    }),
  );
});


export async function generateBattlepass(userId: string, currentSeason: any): Promise<{ success: boolean, is_premium: boolean }> {
  //先查询是否已存在通证
  const useBattlepass = await UserBattlePassSeasons.findOne({ user_id: userId, battlepass_season_id: currentSeason.id });
  if (useBattlepass) {
    return { success: true, is_premium: !!useBattlepass.is_premium }
  }

  let success: boolean = true;
  const is_premium = await isPremiumSatisfied(userId);

  //创建当前奖励信息
  let rewardRecords: any = {
    "standard": {},
    "premium": {}
  }

  //更新
  let maxLv: number = 0;
  let finishedTasks: number = await getFinishedTasks(userId, currentSeason);
  //判断用户已完成的任务数是否已达标
  let now: number = Date.now();
  if (finishedTasks > 0) {
    for (let lv of currentSeason.standard_pass.keys()) {
      if (currentSeason.standard_pass.get(lv).task_line > finishedTasks) {
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
    "user_id": userId,
    "battlepass_season_id": currentSeason.id,
    "finished_tasks": finishedTasks,
    "max_lv": maxLv,
    "reward_records": rewardRecords,
    "total_moon_beam": 0,
    "created_time": now,
    "updated_time": now
  }).save().catch((error: Error) => {
    console.log(error);
    success = false;
  });

  await isPremiumSatisfied(userId);//再调用一次，保存静态的高阶信息
  return { success: success, is_premium: is_premium };
}


async function getFinishedTasks(userId: string, currentSeason: any): Promise<number> {
  const pipeline: PipelineStage[] = [{
    $match: {
      user_id: userId,
    }
  }, {
    //使用vlookup获得在赛季时间内的任务
    $lookup: {
      from: 'quests',
      let: { id: '$quest_id' },
      pipeline: [
        {
          $match: {
            '$and': [{ '$or': [{ 'start_time': { $gte: currentSeason.start_time, $lte: currentSeason.end_time } }, { 'end_time': { $gte: currentSeason.start_time, $lte: currentSeason.end_time } }, { 'start_time': { $lte: currentSeason.start_time }, 'end_time': { $gte: currentSeason.end_time } }] }],
            $expr:
            {
              $and: [
                { $eq: ['$id', '$$id'] }
              ],
            }
          }
        },
        {
          $project: {
            _id: 0,
            id: 1
          }
        }
      ],
      as: 'quest',
    },
  }, {
    $unwind: '$quest'
  }, {
    $project: {
      _id: 0,
      user_id: 1,
      quest_id: 1,
      quest: 1
    }
  }];

  const satisfiedTasks = await QuestAchievement.aggregate(pipeline);

  return satisfiedTasks.length;
}

// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
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
