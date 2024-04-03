import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { maybeAuthInterceptor, mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import BattlePassSeasons, { BattlePassRewardItemType, PassSeries } from '@/lib/models/BattlePassSeasons';
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
  let hasBattlePass: boolean = false;
  let maxLv: number = 0;
  if (userBattleSeason) {
    maxLv = userBattleSeason.max_lv;
    hasBattlePass = true;
  }

  res.json(
    response.success({
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
  current_season.standard_pass.forEach((ps: PassSeries, lvl: string) => {
    standard_pass.push({
      ...ps,
      lv: lvl,
    });
    for (let r of ps.rewards) {
      if (r.type === BattlePassRewardItemType.Badge) {
        badge_id = r.properties.badge_id;
        if (badge_id && badge_ids.indexOf(badge_id) === -1) {
          badge_ids.push(badge_id);
        }
      }
    }
  });
  current_season.premium_pass.forEach((ps: PassSeries, lvl: string) => {
    premium_pass.push({
      ...ps,
      lv: lvl,
    });
    for (let r of ps.rewards) {
      if (r.type === BattlePassRewardItemType.Badge) {
        badge_id = r.properties.badge_id;
        if (badge_id && badge_ids.indexOf(badge_id) === -1) {
          badge_ids.push(badge_id);
        }
      }
    }
  });
  standard_pass = standard_pass.sort((a, b) => a.lv - b.lv);
  premium_pass = premium_pass.sort((a, b) => a.lv - b.lv);

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
  let badgeInfos: Map<string, any> = new Map();
  let targetSeries: any;
  for (let b of badges) {
    for (let k of Object.keys(b.series)) {
      targetSeries = b.series[String(k)];
      delete targetSeries.requirements;
      delete targetSeries.open_for_mint;
      delete targetSeries.reward_moon_beam;
      badgeInfos.set(b.id + k, targetSeries);
    }
  }
  let record: any;
  //拼接用户徽章和领取信息信息
  for (let s of standard_pass) {
    for (let r of s.rewards) {
      if (r.type === BattlePassRewardItemType.Badge) {
        badge_id = r.properties.badge_id;
        r.properties.icon_url = badgeInfos.get(badge_id + s.lv).icon_url;
        r.properties.image_url = badgeInfos.get(badge_id + s.lv).image_url;
        r.properties.description = badgeInfos.get(badge_id + s.lv).description;
      }
    }
    if (user_battle_season) {
      record = user_battle_season.reward_records.get('standard')[s.lv];
      s.satisfied_time = record?.satisfied_time;
      s.claimed_time = record?.claimed_time;
    }
    // standard_pass.push(targetSeries);
  }
  for (let s of premium_pass) {
    for (let r of s.rewards) {
      if (r.type === BattlePassRewardItemType.Badge) {
        badge_id = r.properties.badge_id;
        r.properties.icon_url = badgeInfos.get(badge_id + s.lv).icon_url;
        r.properties.image_url = badgeInfos.get(badge_id + s.lv).image_url;
        r.properties.description = badgeInfos.get(badge_id + s.lv).description;
      }
    }
    if (user_battle_season) {
      record = user_battle_season.reward_records.get('premium')[s.lv];
      s.satisfied_time = record?.satisfied_time;
      s.claimed_time = record?.claimed_time;
    }
    // premium_pass.push(targetSeries);
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
