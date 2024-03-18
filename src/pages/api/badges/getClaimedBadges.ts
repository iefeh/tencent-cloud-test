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

  let badges = await loadUserBadges(userId, pageNum, pageSize);
  //返回用户徽章
  res.json(
    response.success({
      total: badges.length,
      data: badges,
    }),
  );
});

export async function loadUserBadges(userId: string, pageNum: number, pageSize: number): Promise<any[]> {
  const skip = (pageNum - 1) * pageSize;
  const aggregateQuery: PipelineStage[] = [
    {
      $match: {
        user_id: userId,
        display: false
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
  if (results.length > 0) {
    for (let c of results[0].data) {
      maxLv = -Infinity;
      for (let k of Object.keys(c.series)) {
        if (c.series[k].claimed_time != null) {
          maxLv = Number(k);
        }
      }

      let orgBadgeData = c.badge_info[0].series[String(maxLv)];
      c.lv = maxLv;
      c.description = orgBadgeData.description;
      c.icon_url = orgBadgeData.icon_url;
      c.name = c.badge_info[0].name;
      c.has_series = Object.keys(c.badge_info[0].series).length > 1;

      delete c.series;
      delete c.badge_info;
    }
  }
  return results.length > 0 ? results[0].data : [];
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
