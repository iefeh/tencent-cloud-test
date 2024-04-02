import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { maybeAuthInterceptor, mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import BattlePassSeasons from '@/lib/models/BattlePassSeasons';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import Badges from '@/lib/models/Badge';
import { PipelineStage } from 'mongoose';
import { isPremiumSatisfied } from '@/lib/battlepass/battlepass';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
  //获得当前赛季
  const currentSeason = await getCurrentSeason();
  if (!currentSeason) {
    res.json(response.notFound('season not found.'));
    return;
  }

  //判断是否已参与赛季
  let isPremium: boolean = false;
  //处理通行证各等级信息
  let userBattleSeason: any;

  const userId = req.userId;
  console.log(userId);
  if (userId) {
    userBattleSeason = await UserBattlePassSeasons.findOne({
      user_id: userId,
      battlepass_season_id: currentSeason.id,
    });
    isPremium = await isPremiumSatisfied(userId);
  }

  let premiumPass: any[];
  let standardPass: any[];
  [premiumPass, standardPass] = await enrichBattlepassLevelInfos(currentSeason, userBattleSeason);

  let started: boolean = false;
  let hasBattlePass: boolean = false;
  let maxLv: number = 0;
  if (userBattleSeason) {
    started = userBattleSeason.started;
    maxLv = userBattleSeason.max_lv;
    hasBattlePass = true;
  }

  res.json(
    response.success({
      started: started, //用户赛季是否已开始
      has_battle_pass: hasBattlePass, //是否拥有赛季通行证
      is_premium: isPremium, //是否为高阶通行证
      max_lv: maxLv, //用户当前最大等级
      start_time: currentSeason.start_time,
      end_time: currentSeason.end_time,
      standard_pass: standardPass, //标准通行证
      premium_pass: premiumPass, //高阶通行证
    }),
  );
});

async function getCurrentSeason(): Promise<any> {
  //获得当前赛季
  const now: number = Date.now();
  const current_season = await BattlePassSeasons.findOne({ start_time: { $lte: now }, end_time: { $gte: now } });

  return current_season;
}

async function enrichBattlepassLevelInfos(current_season: any, user_battle_season: any): Promise<any[]> {
  let premium_pass: any[] = [];
  let standard_pass: any[] = [];

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
  let pipeline: PipelineStage[] = [
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
  //处理徽章图标等信息
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

  //拼接用户徽章信息
  for (let s of current_season.standard_pass.keys()) {
    target_series = current_season.standard_pass.get(s);
    badge_id = target_series.badge_id;
    target_series.lv = s;
    target_series.icon_url = badge_infos.get(badge_id + s).icon_url;
    target_series.image_url = badge_infos.get(badge_id + s).image_url;
    target_series.description = badge_infos.get(badge_id + s).description;
    if (user_battle_season) {
      target_series.satisfied_time = user_battle_season.reward_records.standard?.get(s)?.satisfied_time;
      target_series.claimed_time = user_battle_season.reward_records.standard?.get(s)?.claimed_time;
    }
    standard_pass.push(target_series);
  }
  for (let s of current_season.premium_pass.keys()) {
    target_series = current_season.premium_pass.get(s)
    badge_id = target_series.badge_id;
    target_series.lv = s;
    target_series.icon_url = badge_infos.get(badge_id + s).icon_url;
    target_series.image_url = badge_infos.get(badge_id + s).image_url;
    target_series.description = badge_infos.get(badge_id + s).description;
    if (user_battle_season) {
      target_series.satisfied_time = user_battle_season.reward_records.premium_pass?.get(s)?.satisfied_time;
      target_series.claimed_time = user_battle_season.reward_records.premium_pass?.get(s)?.claimed_time;
    }
    premium_pass.push(target_series);
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
