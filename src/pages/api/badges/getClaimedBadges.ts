import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { maybeAuthInterceptor, mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBadges, { IUserBadges } from '@/lib/models/UserBadges';
import Badges, { IBadges } from '@/lib/models/Badge';
import { PipelineStage, StringExpressionOperator } from 'mongoose';
import { Data3DTexture } from 'three';
import { result } from 'lodash';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  let userId = req.userId;
  //判断用户是否登录
  if (!userId) {
    res.json(response.unauthorized());
    return;
  }

  //查询该用户的所有徽章
  const { page_num, page_size } = req.query;

  if (!page_num || !page_size) {
    res.json(response.invalidParams());
    return;
  }

  const pageNum = Number(page_num);
  const pageSize = Number(page_size);

  if (pageNum < 0 || pageSize < 0) {
    res.json(response.invalidParams());
    return;
  }

  let badges = await loadUserBadges(userId, pageNum, pageSize, false);
  //返回用户徽章
  res.json(
    response.success({
      total: badges.length,
      data: badges,
    }),
  );
});

export async function loadUserBadges(
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
        created_time: 1,
        updated_time: 1,
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
        if (Number(k) > maxLv && c.series[k].claimed_time != null) {
          maxLv = Number(k);
        }
      }
      if (maxLv === -Infinity) {
        continue;
      }

      let maxLvBadgeData = c.badge_info[0].series[String(maxLv)];
      let maxLvClaimedTime = c.series[String(maxLv)];

      c.lv = maxLv;
      c.description = maxLvBadgeData.description;
      c.icon_url = maxLvBadgeData.icon_url;
      c.image_url = maxLvBadgeData.image_url;
      c.name = c.badge_info[0].name;
      // c.claimed_time = maxLvClaimedTime.claimed_time;
      // c.obtained_time = maxLvClaimedTime.obtained_time;
      c.has_series = Object.keys(c.badge_info[0].series).length > 1;

      let series: any[] = [];
      maxLvBadgeData.lv = maxLv;
      maxLvBadgeData.name = c.name;
      maxLvBadgeData.claimed_time = maxLvClaimedTime.claimed_time;
      maxLvBadgeData.obtained_time = maxLvClaimedTime.obtained_time;
      delete maxLvBadgeData.requirements;
      delete maxLvBadgeData.reward_moon_beam;
      delete maxLvBadgeData.open_for_mint;
      series.push(maxLvBadgeData);

      let nextLvBadgeData = c.badge_info[0].series[String(maxLv + 1)];
      if (nextLvBadgeData != undefined) {
        nextLvBadgeData.lv = maxLv + 1;
        nextLvBadgeData.name = c.name;
        delete nextLvBadgeData.requirements;
        delete nextLvBadgeData.reward_moon_beam;
        delete nextLvBadgeData.open_for_mint;
        series.push(nextLvBadgeData);
      }
      c.series = series;
      data.push(c);
      delete c.badge_info;
    }
  }
  return data;
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
