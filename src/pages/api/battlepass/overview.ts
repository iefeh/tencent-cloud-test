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
    badge_id = current_season.standard_pass.get(s).reward.badge_id;
    if (badge_id) {
      badge_ids.push(badge_id);
    }
  }
  for (let s of current_season.premium_pass.keys()) {
    badge_id = current_season.premium_pass.get(s).reward.badge_id;
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
  //获取各徽章最大等级图标
  let badges_map: Map<string, any> = new Map();
  let badge_max_lv: number;
  let target_series: any;
  for (let b of badges) {
    badge_max_lv = -Infinity;
    for (let s of Object.keys(b.series)) {
      if (Number(s) > badge_max_lv) {
        badge_max_lv = Number(s);
      }
    }
    target_series = b.series[String(badge_max_lv)];
    delete target_series.requirements;
    delete target_series.open_for_mint;
    delete target_series.reward_moon_beam;
    badges_map.set(b.id, target_series);
  }

  //赛季数据中补充徽章信息
  let target_reward: any;
  for (let s of current_season.standard_pass.keys()) {
    target_reward = current_season.standard_pass.get(s).reward;
    if (target_reward.badge_id) {
      target_reward.badge_info = badges_map.get(target_reward.badge_id);
    }
  }
  for (let s of current_season.premium_pass.keys()) {
    target_reward = current_season.premium_pass.get(s).reward;
    if (target_reward.badge_id) {
      target_reward.badge_info = badges_map.get(target_reward.badge_id);
    }
  }

  return current_season;
}

async function loadBattlepassLevelInfo(current_season: any, user_battle_season: any): Promise<any[]> {
  let premium_pass: any[] = [];
  let standard_pass: any[] = [];
  if (!user_battle_season) {
    user_battle_season = {};
    user_battle_season.reward_records = {};
    user_battle_season.type = '';
  }
  //处理标准通证
  let target: any;
  for (let c of current_season.standard_pass.keys()) {
    target = current_season.standard_pass.get(c);
    target.lv = c;
    if (user_battle_season.type === BattlePassType.StandardPass && user_battle_season.reward_records != null) {
      target.satisfied_time = user_battle_season.reward_records.get(c)?.satisfied_time;
      target.claimed_time = user_battle_season.reward_records.get(c)?.claimed_time;
    }
    delete target.requirements;
    standard_pass.push(target);
  }
  //处理高阶通证
  for (let c of current_season.premium_pass.keys()) {
    target = current_season.premium_pass.get(c);
    target.lv = c;
    if (user_battle_season.type === BattlePassType.PremiumPass && user_battle_season.reward_records != null) {
      target.satisfied_time = user_battle_season.reward_records.get(c)?.satisfied_time;
      target.claimed_time = user_battle_season.reward_records.get(c)?.claimed_time;
    }
    delete target.requirements;
    premium_pass.push(target);
  }

  return [premium_pass, standard_pass];
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
