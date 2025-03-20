import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { maybeAuthInterceptor, mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { BattlePassRewardItemType, PassSeries } from '@/lib/models/BattlePassSeasons';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import Badges from '@/lib/models/Badge';
import { PipelineStage } from 'mongoose';
import { getAllRequirements, getCurrentBattleSeason, premiumSatisfy } from '@/lib/battlepass/battlepass';
import { errorInterceptor } from '@/lib/middleware/error';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), maybeAuthInterceptor).get(async (req, res) => {
  //获得当前赛季
  const currentSeason = await getCurrentBattleSeason();
  if (!currentSeason) {
    res.json(response.notFound('season not found.'));
    return;
  }

  //判断是否已参与赛季
  const userId = req.userId;
  let userBattleSeason: any;//用户赛季通行证
  let hasBattlePass: boolean = false;
  let maxLv: number = 0;
  let passInfo: any = { is_premium: false };
  let currentProgress: number = 0
  if (userId) {
    userBattleSeason = await UserBattlePassSeasons.findOne({
      user_id: userId,
      battlepass_season_id: currentSeason.id,
    });
    //判断用户是否有赛季通证
    if (userBattleSeason) {
      //取出赛季通行证中的信息
      maxLv = userBattleSeason.max_lv;
      hasBattlePass = true;
      currentProgress = userBattleSeason.finished_tasks;
      if (userBattleSeason.is_premium) {
        passInfo.is_premium = userBattleSeason.is_premium;
        passInfo.premium_type = userBattleSeason.premium_type;
        passInfo.premium_source = userBattleSeason.premium_source;
      } else {
        passInfo = await premiumSatisfy(userId);
      }
    }
  }
  const allRequirements = await getAllRequirements();

  let premiumPass: any[];
  let standardPass: any[];
  [premiumPass, standardPass] = await enrichBattlepassLevelInfos(currentSeason, userBattleSeason);

  res.json(
    response.success({
      has_battle_pass: hasBattlePass, //是否拥有赛季通行证
      is_premium: passInfo.is_premium, //是否为高阶通行证
      premium_type: passInfo.premium_type,//高阶通证类型
      premium_source: passInfo.premium_source,//高阶通证类型
      all_requirements: allRequirements,
      max_lv: maxLv, //用户当前最大等级
      current_progress: currentProgress,//当前任务进度
      start_time: currentSeason.start_time,
      end_time: currentSeason.end_time,
      standard_pass: standardPass, //标准通行证
      premium_pass: premiumPass, //高阶通行证
    }),
  );
});

//增加赛季通证各等级信息，主要是徽章信息
async function enrichBattlepassLevelInfos(current_season: any, user_battle_season: any): Promise<any[]> {
  let premium_pass: any[] = [];
  let standard_pass: any[] = [];
  let badge_ids: any[] = [];
  let badge_id: string;

  //处理标准通证，为了方便后续处理，将所以等级转化为数组
  current_season.standard_pass.forEach((ps: PassSeries, lvl: string) => {
    standard_pass.push({
      ...ps,
      lv: lvl,
    });
    //将各等级中的徽章ID保存起来，用于后续查找
    for (let r of ps.rewards) {
      if (r.type === BattlePassRewardItemType.Badge) {
        badge_id = r.properties.badge_id;
        if (badge_id && badge_ids.indexOf(badge_id) === -1) {
          badge_ids.push(badge_id);
        }
      }
    }
  });
  //同样的方式处理高阶通证，和各等级徽章ID
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
  //根据等级进行排序
  standard_pass = standard_pass.sort((a, b) => a.lv - b.lv);
  premium_pass = premium_pass.sort((a, b) => a.lv - b.lv);

  //查询徽章信息
  let pipeline: PipelineStage[] = [
    { $match: { id: { $in: badge_ids } } },
    {
      $project: {
        _id: 0,
        id: 1,
        name: 1,
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
      targetSeries.name = b.name;
      // delete targetSeries.requirements;
      // delete targetSeries.open_for_mint;
      // delete targetSeries.reward_moon_beam;
      badgeInfos.set(b.id + k, targetSeries);
    }
  }
  let record: any;
  let claimed: boolean;
  //拼接用户徽章和领取信息信息
  for (let s of standard_pass) {
    claimed = false;
    if (user_battle_season) {
      record = user_battle_season.reward_records.get('standard')[s.lv];
      s.satisfied_time = record?.satisfied_time;
      s.claimed_time = record?.claimed_time;
      claimed = !!s.claimed_time;
    }
    for (let r of s.rewards) {
      if (r.type === BattlePassRewardItemType.Badge) {
        badge_id = r.properties.badge_id;
        r.properties.amount = 1;
        r.properties.name = badgeInfos.get(badge_id + s.lv).name;
        r.properties.image_url = badgeInfos.get(badge_id + s.lv).image_url;
        r.properties.description = badgeInfos.get(badge_id + s.lv).description;
        delete r.properties.badge_id;
      } else {
        if (!claimed) {
          delete r.properties.description_claimed;
        }
      }
    }
  }
  for (let s of premium_pass) {
    claimed = false;
    if (user_battle_season) {
      record = user_battle_season.reward_records.get('premium')[s.lv];
      s.satisfied_time = record?.satisfied_time;
      s.claimed_time = record?.claimed_time;
      claimed = !!s.claimed_time;
    }
    for (let r of s.rewards) {
      if (r.type === BattlePassRewardItemType.Badge) {
        badge_id = r.properties.badge_id;
        r.properties.amount = 1;
        r.properties.name = badgeInfos.get(badge_id + s.lv).name;
        r.properties.image_url = badgeInfos.get(badge_id + s.lv).image_url;
        r.properties.description = badgeInfos.get(badge_id + s.lv).description;
        delete r.properties.badge_id;
      } else {
        if (!claimed) {
          delete r.properties.description_claimed;
        }
      }
    }
    // premium_pass.push(targetSeries);
  }

  return [premium_pass, standard_pass];
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
