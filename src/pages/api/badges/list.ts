import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { maybeAuthInterceptor, mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBadges, { IUserBadges } from '@/lib/models/UserBadges';
import Badges, { IBadges } from '@/lib/models/Badge';
import { PipelineStage, StringExpressionOperator } from 'mongoose';
import { Data3DTexture } from 'three';
import { ka } from 'date-fns/locale';
import Mint from '@/lib/models/Mint';

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

  let [badges, claimed_count] = await loadAllBadges(userId, pageNum, pageSize);
  //返回用户徽章
  res.json(
    response.success({
      total: badges.length,
      claimed_count: claimed_count,
      badges: badges,
    }),
  );
});

export async function loadAllBadges(userId: string, pageNum: number, pageSize: number): Promise<[any[], number]> {
  const skip = (pageNum - 1) * pageSize;
  const aggregateQuery: PipelineStage[] = [
    {
      $match: {
        active: true,
      },
    },
    {
      $lookup: {
        from: 'user_badges',
        let: { badge_id: '$id' },
        pipeline: [
          // 联表时过滤已删除的记录
          {
            $match: { $expr: { $and: [{ $eq: ['$user_id', userId] }, { $eq: ['$badge_id', '$$badge_id'] }] } },
          },
        ],
        as: 'user_badges',
      },
    },
    {
      $project: {
        _id: 0,
        id: 1,
        name: 1,
        series: 1,
        order: 1,
        created_time: 1,
        updated_time: 1,
        user_badges: '$user_badges',
        item_count: { $size: '$user_badges' },
      },
    },
    {
      $sort: {
        // 按照'order'升序排序
        item_count: -1,
        order: 1,
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: pageSize }],
      },
    },
  ];
  const results = await Badges.aggregate(aggregateQuery);
  let data: any[] = [];
  let claimed_count: number = 0;
  let claimed: boolean;
  let maxLv: number;
  let claimedLv: number = 0;
  if (results.length > 0) {
    for (let c of results[0].data) {
      let series: any = [];
      if (c.user_badges.length > 0) {// 用户已获得该徽章
        c.has_series = Object.keys(c.series).length > 1;
        maxLv = 0;
        //获取用户最大等级
        claimed = false;
        for (let k of Object.keys(c.user_badges[0].series)) {
          if (Number(k) > maxLv) {
            maxLv = Number(k);
          }
          if (c.user_badges[0].series[k].claimed_time != null) {
            claimed = true;
            claimedLv = Number(k);
          }
        }


        let distributedBadge = c.user_badges[0].series[String(maxLv)];
        let orgBadgeData = c.series[String(maxLv)];
        let nextLvBadge = c.series[String(maxLv + 1)];
        distributedBadge.lv = maxLv;
        distributedBadge.name = c.name;
        distributedBadge.description = orgBadgeData.description;
        distributedBadge.icon_url = orgBadgeData.icon_url;
        distributedBadge.image_url = orgBadgeData.image_url;
        if (claimed) {
          // 获取MINT信息
          const mintInfo = await getMintInfo(userId, c.id, String(claimedLv));
          distributedBadge.mint = mintInfo;
          claimed_count++;
        }

        series.push(distributedBadge);
        c.display = c.user_badges[0].display;
        c.display_order = c.user_badges[0].display_order;
        if (nextLvBadge != undefined) {
          delete nextLvBadge.requirements;
          delete nextLvBadge.open_for_mint;
          nextLvBadge.name = c.name;
          nextLvBadge.lv = maxLv + 1;
          series.push(nextLvBadge);
        }
        c.user_id = distributedBadge.user_id;
      } else {
        c.has_series = Object.keys(c.series).length > 1;
        let k = Object.keys(c.series)[0];
        c.series[k].lv = Number(k);
        c.series[k].name = c.name;
        delete c.series[k].requirements;
        delete c.series[k].open_for_mint;

        series.push(c.series[k]);
      }
      c.badge_id = c.id;
      delete c.user_badges;
      delete c.id;
      delete c.item_count;
      c.series = series;
      data.push(c);
    }
  }

  return [data, claimed_count];
}

export async function getClaimedCount(userId: string): Promise<number> {
  let results: any[] = await UserBadges.find({ user_id: userId }, { _id: 0, series: 1 });
  let claimed_count: number = 0;
  for (let b of results) {
    for (let k of b.series.keys()) {
      if (b.series.get(k).claimed_time != null) {
        claimed_count++;
        break;
      }
    }
  }
  return claimed_count;
}

// 查询mint信息
async function getMintInfo(userId: string, sourceId: string, level: string): Promise<any> {
  return await Mint.findOne({ user_id: userId, source_id: sourceId, badge_level: level }, { _id: 0, id: 1, status: 1, obtained_time: 1 })
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
