import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import BattlePassSeasons from '@/lib/models/BattlePassSeasons';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import Badges from '@/lib/models/Badge';
import { PipelineStage } from 'mongoose';
import { isPremiumSatisfied } from './to_premium';
import UserBadges from '@/lib/models/UserBadges';

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
  [premium_pass, standard_pass] = await enrichBattlepassLevelInfos(userId, current_season, user_battle_season);

  let started: boolean = false;
  let has_battle_pass: boolean = false;
  let max_lv: number = 0;
  if (user_battle_season) {
    is_premium = user_battle_season.type === BattlePassType.PremiumPass;
    started = user_battle_season.started;
    max_lv = user_battle_season.max_lv;
    has_battle_pass = true;
  } else {
    //返回用户未开始赛季的数据
    is_premium = await isPremiumSatisfied(userId);
  }


  res.json(
    response.success({
      started: started, //用户赛季是否已开始
      has_battle_pass: has_battle_pass, //是否拥有赛季通行证
      is_premium: is_premium, //是否为高阶通行证
      max_lv: max_lv, //用户当前最大等级
      start_time: current_season.start_time,
      end_time: current_season.end_time,
      standard_pass: standard_pass, //标准通行证
      premium_pass: premium_pass, //高阶通行证
    }),
  );
});

async function getCurrentSeason(): Promise<any> {
  //获得当前赛季
  const now: number = Date.now();
  const current_season = await BattlePassSeasons.findOne({ start_time: { $lte: now }, end_time: { $gte: now } });

  return current_season;
}

async function enrichBattlepassLevelInfos(user_id: string, current_season: any, user_battle_season: any): Promise<any[]> {
  let premium_pass: any[] = [];
  let standard_pass: any[] = [];

  let badge_ids: any[] = [];
  let badge_id: string;
  let badge2type: Map<String, BattlePassType> = new Map();
  for (let s of current_season.standard_pass.keys()) {
    badge_id = current_season.standard_pass.get(s).badge_id;
    if (badge_id) {
      badge2type.set(badge_id, BattlePassType.StandardPass);
      badge_ids.push(badge_id);
    }
  }
  for (let s of current_season.premium_pass.keys()) {
    badge_id = current_season.premium_pass.get(s).badge_id;
    if (badge_id) {
      badge2type.set(badge_id, BattlePassType.PremiumPass);
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
  //查询用户徽章信息
  pipeline = [
    {
      $match: {
        user_id: user_id, badge_id: { $in: badge_ids }
      }
    },
    {
      $project: {
        _id: 0,
        badge_id: 1,
        series: 1,
      },
    },
  ];

  let user_badges: any[] = await UserBadges.aggregate(pipeline);
  let badge_dist_infos: Map<string, any> = new Map();
  for (let b of user_badges) {
    for (let k of Object.keys(b.series)) {
      target_series = b.series[String(k)];
      badge_dist_infos.set(b.badge_id + k, target_series);
    }
  }
  //修改用户通证信息
  await updateUserBattlepassRewardRecords(user_id, user_badges, user_battle_season, badge2type);

  //拼接用户徽章信息
  for (let s of current_season.standard_pass.keys()) {
    target_series = current_season.standard_pass.get(s);
    badge_id = target_series.badge_id;
    target_series.lv = s;
    target_series.icon_url = badge_infos.get(badge_id + s).icon_url;
    target_series.image_url = badge_infos.get(badge_id + s).image_url;
    target_series.description = badge_infos.get(badge_id + s).description;
    target_series.satisfied_time = badge_dist_infos.get(badge_id + s)?.obtained_time;
    target_series.claimed_time = badge_dist_infos.get(badge_id + s)?.claimed_time;
    delete target_series.requirements;
    standard_pass.push(target_series);
  }
  for (let s of current_season.premium_pass.keys()) {
    target_series = current_season.premium_pass.get(s)
    badge_id = target_series.badge_id;
    target_series.lv = s;
    target_series.icon_url = badge_infos.get(badge_id + s).icon_url;
    target_series.image_url = badge_infos.get(badge_id + s).image_url;
    target_series.description = badge_infos.get(badge_id + s).description;
    target_series.satisfied_time = badge_dist_infos.get(badge_id + s)?.obtained_time;
    target_series.claimed_time = badge_dist_infos.get(badge_id + s)?.claimed_time;
    delete target_series.requirements;
    premium_pass.push(target_series);
  }

  return [premium_pass, standard_pass];
}

async function updateUserBattlepassRewardRecords(user_id: string, user_badges: any[], user_battle_season: any, badge2type: Map<String, BattlePassType>) {
  let max_lv: number = 0;
  let target_series: any;
  let update: any = {};
  for (let b of user_badges) {
    let series: any = {};
    for (let k of Object.keys(b.series)) {
      target_series = b.series[String(k)];
      series[k] = { satisfied_time: target_series.obtained_time, claimed_time: target_series?.claimed_time };
      if (Number(k) > max_lv) {
        max_lv = Number(k);
      }
    }
    if (badge2type.get(b.badge_id) === BattlePassType.PremiumPass) {
      if (user_battle_season.reward_records.premium == null || Object.keys(user_battle_season.reward_records.premium).length < Object.keys(b.series).length) {
        update[`reward_records.premium`] = series;
      }
    }
    if (badge2type.get(b.badge_id) === BattlePassType.StandardPass) {
      if (user_battle_season.reward_records.standard == null || Object.keys(user_battle_season.reward_records.standard).length < Object.keys(b.series).length) {
        let update: any = {};
        update[`reward_records.standard`] = series;
      }
    }
  }
  //修改用户最高等级
  if (user_battle_season.max_lv < max_lv) {
    update['max_lv'] = max_lv;
  }
  //进行升级
  if (Object.keys(update).length > 0) {
    console.log(update);
    update['updated_time'] = Date.now();
    await UserBattlePassSeasons.updateOne({ user_id: user_id, battlepass_season_id: user_battle_season.battlepass_season_id }, update);
  }
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
