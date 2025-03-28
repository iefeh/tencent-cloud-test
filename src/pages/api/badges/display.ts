import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import Badges from '@/lib/models/Badge';
import { PipelineStage, StringExpressionOperator } from 'mongoose';
import { getClaimedCount, loadAllBadges } from './list';
import UserBadges, { IUserBadges } from '@/lib/models/UserBadges';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  let userId = req.userId;
  //判断用户是否登录
  if (!userId) {
    res.json(response.unauthorized());
    return;
  }

  const [result, claimed_count] = await getUserDisplayedBadges(userId);
  res.json(
    response.success({
      claimed_count: claimed_count,
      result: result,
    }),
  );
});
async function getUserDisplayedBadges(userId: string): Promise<[any[], number]> {
  let claimed: boolean;
  let claimed_count: number = await getClaimedCount(userId);
  let results: any[] = await loadUserDisplayBadges(userId, 1, 5, true);

  //const badges = await Badges.find({id: badgeId});
  return [results, claimed_count];
}

export async function loadUserDisplayBadges(
  userId: string,
  pageNum: number,
  pageSize: number,
  display: boolean,
): Promise<any[]> {
  const skip = (pageNum - 1) * pageSize;
  const aggregateQuery: PipelineStage[] = [
    {
      $match: {
        user_id: userId,
        display: display,
      },
    },
    {
      $lookup: {
        from: 'badges',
        let: { id: '$badge_id' },
        pipeline: [
          // 联表时过滤已删除的记录
          {
            $match: { $expr: { $and: [{ $eq: ['$id', '$$id'] }] } },
          },
        ],
        as: 'badge_info',
      },
    },
    {
      $sort: {
        // 按照'order'升序排序
        order: 1,
      },
    },
    {
      $project: {
        _id: 0,
        badge_id: 1,
        display: 1,
        display_order: 1,
        series: 1,
        badge_info: '$badge_info',
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: pageSize }],
      },
    },
  ];
  const results = await UserBadges.aggregate(aggregateQuery);
  let maxLv: number;
  let data: any[] = [];
  if (results.length > 0) {
    for (let c of results[0].data) {
      maxLv = -Infinity;
      for (let k of Object.keys(c.series)) {
        if (Number(k) > maxLv) {
          maxLv = Number(k);
        }
      }
      if (maxLv === -Infinity) {
        continue;
      }

      let orgBadgeData = c.badge_info[0].series[String(maxLv)];

      c.lv = maxLv;
      c.description = orgBadgeData.description;
      c.icon_url = orgBadgeData.icon_url;
      c.image_url = orgBadgeData.image_url;
      c.name = c.badge_info[0].name;
      c.has_series = Object.keys(c.badge_info[0].series).length > 1;

      let series: any[] = [];
      let maxLvData = c.series[String(maxLv)];
      maxLvData.lv = maxLv;
      maxLvData.description = c.description;
      maxLvData.icon_url = c.icon_url;
      maxLvData.image_url = c.image_url;
      maxLvData.name = c.name;
      series.push(maxLvData);
      let nextLvBadge =c.badge_info[0].series[String(maxLv+1)];
      if ( nextLvBadge !== undefined) {
        nextLvBadge.lv = maxLv+1;
        nextLvBadge.name = c.name;
        delete nextLvBadge.requirements;
        delete nextLvBadge.open_for_mint;
        series.push(nextLvBadge);
      }
      c.series = series;
      data.push(c);
      delete c.badge_info;
    }
  }
  return data;
}

//获取该徽章下最高等级的奖章
export async function getMaxLevelBadge(badgeId: string): Promise<any> {
  const badges = await Badges.find({ id: badgeId });
  //判断是否有徽章
  if (badges.length == 0) {
    return { description: '', image_url: '', open_for_mint: false, requirements: [], icon_url: '' };
  }

  //获取最高等级的徽章
  let maxLevel: number | string;
  maxLevel = -Infinity; //不能使用Number.MIN_VALUE指定为最小值，当LV是0时会异常
  for (let c of badges[0].series.keys()) {
    if (Number(c) > maxLevel) {
      maxLevel = Number(c);
    }
  }
  maxLevel = String(maxLevel);
  badges[0].series.get(maxLevel).name = badges[0].name;
  return badges[0].series.get(maxLevel);
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
