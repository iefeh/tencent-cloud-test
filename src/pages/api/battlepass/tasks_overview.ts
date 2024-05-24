import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { PipelineStage } from 'mongoose';
import { errorInterceptor } from '@/lib/middleware/error';
import QuestClassification, { ClassificationType } from "@/lib/models/QuestClassification";
import { getCurrentBattleSeason, getUserBattlePass } from "@/lib/battlepass/battlepass";
import { format } from "date-fns";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const userId = req.userId!;
  const userBattlePass = await getUserBattlePass(userId);
  if (!userBattlePass) {
    res.json(response.notFound("Please claim your Season Pass first."));
    return;
  }
  const result = await getUserTasksOverviewRawInfo(userId);
  let achieveCount: number;
  let isNew: boolean;
  //处理返回的结果
  for (let c of result) {
    achieveCount = 0;
    isNew = false;
    for (let q of c.quests) {
      if (q.achieve_count) {
        achieveCount++;
      } else if (Date.now() - q.created_time < 7 * 24 * 3600 * 1000) {
        isNew = true;
      }
    }
    delete c.quests;//删除任务的具体信息。
    c.achieve_count = achieveCount;
    c.is_new = isNew;
  }
  res.json(response.success({
    is_premium: userBattlePass.is_premium,
    premium_type: userBattlePass.premium_type,
    premium_source: userBattlePass.premium_source,
    finished_tasks: userBattlePass.finished_tasks,
    result: result
  }));
});
//查询用户任务情况总览，先通过查询分类表获取所有的分类，再分别vlookup quests表和quest_achievements表，获得对应的任务数量和完成情况。
export async function getUserTasksOverviewRawInfo(userId: string): Promise<any> {
  const currentSeason = await getCurrentBattleSeason();
  const now = Date.now();
  const pipeline: PipelineStage[] = [
    {
      $match: {
        type: ClassificationType.Category,
        active: true
      }
    }, {//使用vlookup获得该种类下面的所有任务
      $lookup: {
        from: 'quests',
        let: { category: '$id' },
        pipeline: [
          {
            $match: {
              'active': true,
              'deleted_time': null,
              'start_time': { $lte: now },
              'end_time': { $gt: now },
              //开始时间需要和当前赛季有一定关联，即开始时间在赛季期间,结束时间在赛季期间或开始时间结束时间横跨整个赛季。
              '$and': [{ '$or': [{ 'start_time': { $gte: currentSeason.start_time, $lte: currentSeason.end_time } }, { 'end_time': { $gte: currentSeason.start_time, $lte: currentSeason.end_time } }, { 'start_time': { $lte: currentSeason.start_time }, 'end_time': { $gte: currentSeason.end_time } }] }],
              $expr: { $and: [{ $eq: ['$category', '$$category'] }] }
            },
          },
          {//使用vlookup获得用户该任务下的完成记录
            $lookup: {
              from: 'quest_achievements',
              let: { quest_id: '$id' },
              pipeline: [
                {
                  $match: { $expr: { $and: [{ $eq: ['$user_id', userId] }, { $or: [{ $eq: ['$quest_id', { $concat: [{ $toString: "$$quest_id" }, `,${format(Date.now(),'yyyy-MM-dd')}`] }] }, { $eq: ['$quest_id', '$$quest_id'] }] }] } },
                },
                {
                  $project: {
                    _id: 0,
                    user_id: 1,
                    quest_id: 1
                  }
                }
              ],
              as: 'achievements',
            },
          },
          {
            $project: {
              _id: 0,
              id: 1,
              created_time: 1,
              achievements: 1,
              achieve_count: { $size: '$achievements' }
            }
          }
        ],
        as: 'quests',
      },
    },
    {
      $sort: {
        order: 1
      }
    },
    {
      $project: {
        _id: 0,
        id: 1,
        name: 1,
        image_url: 1,
        quests: 1,
        quest_count: { $size: '$quests' }
      }
    }
  ];

  const result = await QuestClassification.aggregate(pipeline);

  return result;
}

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