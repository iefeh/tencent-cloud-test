import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import BattlePassSeasons from '@/lib/models/BattlePassSeasons';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import UserMetrics from '@/lib/models/UserMetrics';
import Badges from '@/lib/models/Badge';
import { PipelineStage } from 'mongoose';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const user_id = req.userId;
  const userId = String(user_id);

  //获得当前赛季
  const now: number = Date.now();
  const current_season = await getCurrentSeason();
  if (!current_season) {
    res.json(response.notFound('season not found.'));
    return;
  }

  //判断是否已参与赛季
  let is_premium: boolean = false;
  //处理通行证各等级信息
  const user_battle_season: any = await UserBattlePassSeasons.findOne({
    user_id: userId,
    battlepass_season_id: current_season.id,
  });

  let premium_pass: any[];
  let standard_pass: any[];
  let started: boolean = false;
  let has_battle_pass: boolean = false;
  let max_lv: number = 0;
  [premium_pass, standard_pass] = await loadBattlepassLevelInfo(current_season, user_battle_season);
  if (user_battle_season) {
    is_premium = user_battle_season.type === BattlePassType.PremiumPass;
    started = user_battle_season.started;
    max_lv = user_battle_season.max_lv;
    has_battle_pass = true;
  } else {
    //返回用户未开始赛季的数据
    const userMetric: any = await UserMetrics.findOne({ user_id: userId });
    if (userMetric) {
      is_premium = Boolean(userMetric.tetra_holder);
    }
    await generateUserBattlePass(userId, current_season.id, is_premium ? BattlePassType.PremiumPass : BattlePassType.StandardPass);
  }

  res.json(
    response.success({
      started: started, //用户赛季是否已开始
      has_battle_pass: has_battle_pass, //是否拥有赛季通行证
      is_premium: is_premium, //是否为高阶通行证
      max_lv: max_lv, //用户当前最大等级
      standard_pass: standard_pass, //标准通行证
      premium_pass: premium_pass, //高阶通行证
    }),
  );
});

async function getCurrentSeason(): Promise<any> {
  //获得当前赛季
  const now: number = Date.now();
  const current_season = await BattlePassSeasons.findOne({ start_time: { $lte: now }, end_time: { $gte: now } });
  let badge_ids: any[] = [];
  let badge_id: string;
  for (let s of current_season.standard_pass.keys()) {
    badge_id = current_season.standard_pass.get(s).badge_id;
    if (badge_id) {
      badge_ids.push(badge_id);
    }
  }
  for (let s of current_season.premium_pass.keys()) {
    badge_id = current_season.premium_pass.get(s).badge_id;
    if (badge_id) {
      badge_ids.push(badge_id);
    }
  }

  //查询徽章信息
  const pipeline: PipelineStage[] = [
    { $match: { id: { $in: badge_ids } } },
    {
      $project: {
        _id: 0,
        id: 1,
        series: 1,
      },
    },
  ];

  let badges: any[] = await Badges.aggregate(pipeline);
  //填入徽章信息
  let badge_infos: Map<string, any> = new Map();
  let target_series: any;
  for (let b of badges) {
    for (let k of Object.keys(b.series)) {
      target_series = b.series[String(k)];
      delete target_series.requirements;
      delete target_series.open_for_mint;
      delete target_series.reward_moon_beam;
      badge_infos.set(b.id + k, target_series);
    }
  }
  for (let s of current_season.standard_pass.keys()) {
    target_series = current_season.standard_pass.get(s);
    badge_id = target_series.badge_id;
    target_series.icon_url = badge_infos.get(badge_id + s).icon_url;
    target_series.image_url = badge_infos.get(badge_id + s).image_url;
    target_series.description = badge_infos.get(badge_id + s).description;
  }
  for (let s of current_season.premium_pass.keys()) {
    target_series = current_season.premium_pass.get(s)
    badge_id = target_series.badge_id;
    target_series.icon_url = badge_infos.get(badge_id + s).icon_url;
    target_series.image_url = badge_infos.get(badge_id + s).image_url;
    target_series.description = badge_infos.get(badge_id + s).description;
  }

  return current_season;
}

async function loadBattlepassLevelInfo(current_season: any, user_battle_season: any): Promise<any[]> {
  console.log(user_battle_season);
  let premium_pass: any[] = [];
  let standard_pass: any[] = [];
  if (!user_battle_season) {
    user_battle_season = {};
    user_battle_season.reward_records = new Map();
    user_battle_season.reward_records["standard"] = null;
    user_battle_season.reward_records["premium"] = null;
    user_battle_season.type = '';
  }
  //处理标准通证
  let target: any;
  for (let c of current_season.standard_pass.keys()) {
    target = current_season.standard_pass.get(c);
    target.lv = c;
    if (user_battle_season.reward_records.get("standard") != null) {
      target.satisfied_time = user_battle_season.reward_records.get("standard")[c]?.satisfied_time;
      target.claimed_time = user_battle_season.reward_records.get("standard")[c]?.claimed_time;
    }
    delete target.requirements;
    standard_pass.push(target);
  }
  //处理高阶通证
  for (let c of current_season.premium_pass.keys()) {
    target = current_season.premium_pass.get(c);
    target.lv = c;
    if (user_battle_season.reward_records.get("premium") != null) {
      target.satisfied_time = user_battle_season.reward_records.get("premium")[c]?.satisfied_time;
      target.claimed_time = user_battle_season.reward_records.get("premium")[c]?.claimed_time;
    }
    delete target.requirements;
    premium_pass.push(target);
  }

  return [premium_pass, standard_pass];
}

export async function getCurrentBattleSeasonId(): Promise<any> {
  const now: number = Date.now();
  const current_season = await BattlePassSeasons.findOne({ start_time: { $lte: now }, end_time: { $gte: now } });
  return current_season.id;
}

async function generateUserBattlePass(user_id: string, season_id: number, type: string) {
  //创建赛季通行证
  await UserBattlePassSeasons.insertMany([
    {
      "user_id": user_id,
      "battlepass_season_id": season_id,
      "started": false,
      "finished_tasks": 0,
      "max_lv": 0,
      "type": type,
      "reward_records": {
        "standard": null,
        "premium": null
      },
      "total_moon_beam": 0,
      "created_time": Date.now(),
      "updated_time": Date.now()
    }
  ]).catch((error: Error) => {
    console.log(error);
  });
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
