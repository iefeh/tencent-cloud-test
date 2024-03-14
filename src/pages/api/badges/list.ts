import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { maybeAuthInterceptor, mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBadges, { IUserBadges } from '@/lib/models/UserBadges';
import Badges, { IBadges } from '@/lib/models/Badge';
import { PipelineStage } from 'mongoose';

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
  let ownedIds: any[] = [];
  if (badges[0].data.length < pageSize) {
    if (badges[0].data.length == 0) {
      const result = await loadUserBadgesCount(userId);
      let skip: number;
      if (result[0].data.length == 0) {
        skip = 0;
      } else {
        skip = (pageNum - 1) * pageSize - result[0].data.length;
        for (let c of result[0].data) {
          ownedIds.push(c.badge_id);
        }
      }
      badges = await loadAllBadge(skip, pageSize, ownedIds);
    } else {
      for (let c of badges[0].data) {
        ownedIds.push(c.badge_id);
      }
      const temp = await loadAllBadge(0, pageSize - badges[0].data.length, ownedIds);

      for (let c of temp[0].data) {
        badges[0].data.push(c);
      }
    }
  }
  //返回用户徽章
  res.json(
    response.success({
      total: badges[0].data.length,
      claimed_count: badges[0].claimed_count,
      badges: badges[0].data
    }),
  );
});

export async function loadUserBadges(userId: string, pageNum: number, pageSize: number): Promise<any[]> {
  const skip = (pageNum - 1) * pageSize;
  let claimed_count = 0; //已领取徽章计数
  let claimed: boolean;
  const aggregateQuery: PipelineStage[] = [
    {
      $match: {
        user_id: userId,
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
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: pageSize }],
      },
    },
  ];

  const badges = await UserBadges.aggregate(aggregateQuery);

  for (let c of badges[0].data) {
    //查询徽章配置
    let b = await Badges.find({ id: c.badge_id });
    if (b[0] == undefined) {
      continue;
    }

    //获取用户最高等级徽章
    let lv = -99999; //不能使用Number.MIN_VALUE指定为最小值，当LV是0时会异常
    //分别获取领取的最高等级和未领取的最高等级
    claimed = false;
    for (let k of Object.keys(c.series)) {
      if (c.series[k].claimed_time != null) {
        claimed = true;
      }
      if (Number(k) > lv) {
        lv = Number(k);
      }
    }
    if (claimed) {
      claimed_count++;
    }


    //添加徽章的信息
    let displayedBadges: any = [];
    let t = b[0].series.get(String(lv));

    displayedBadges.push({
      lv: lv,
      name: b[0].name,
      description: t.description,
      icon_url: t.icon_url,
      image_url: t.image_url,
      obtained_time: c.series[String(lv)].obtained_time,
      claimed_time: c.series[String(lv)].claimed_time,
    });

    t = b[0].series.get(String(lv + 1));
    if (t != undefined) {
      displayedBadges.push({
        lv: lv + 1,
        name: b[0].name,
        description: t.description,
        icon_url: t.icon_url,
        image_url: t.image_url,
        // obtained_time: undefined,
        // claimed_time: undefined,
      });
    } else {
      displayedBadges.push(null);
    }
    //delete c.series;
    c.series = displayedBadges;

    //是否为系列徽章
    if (Array.from(b[0].series.keys()).length > 1) {
      c.has_series = true;
    } else {
      c.has_series = false;
    }
  }
  badges[0].claimed_count = claimed_count;
  return badges;
}

export async function loadAllBadge(skip: number, pageSize: number, ownedIds: any[]): Promise<any[]> {
  const aggregateQuery: PipelineStage[] = [
    {
      $match: {
        active: true,
        id: { $nin: ownedIds },
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
        //id:"$badge_id",
        _id: 0,
        __v: 0,
        chain_id: 0,
        deleted_time: 0,
        description: 0,
        obtain_url: 0,
        active: 0,
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: pageSize }],
      },
    },
  ];

  const badges = await Badges.aggregate(aggregateQuery);
  let lv: number;
  for (let c of badges[0].data) {
    c['badge_id'] = c.id;
    //获取最低等级
    lv = Number.MAX_VALUE;
    for (let k of Object.keys(c.series)) {
      if (Number(k) < lv) {
        lv = Number(k);
      }
    }

    let displayedBadges: any = [];
    let t = c.series[String(lv)];
    displayedBadges.push({
      lv: lv,
      name: c.name,
      description: t.description,
      icon_url: t.icon_url,
      image_url: t.image_url,
    });
    displayedBadges.push(null);
    delete c.id;
    c.series = displayedBadges;
  }

  return badges;
}

async function loadUserBadgesCount(userId: string): Promise<any[]> {
  console.log('loadUserBadgesCount');
  const aggregateQuery: PipelineStage[] = [
    {
      $match: {
        user_id: userId,
      },
    },
    {
      $project: {
        badge_id: 1,
      },
    },
  ];

  const result = await UserBadges.aggregate(aggregateQuery);
  return result;
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
