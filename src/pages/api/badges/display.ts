import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import Badges from '@/lib/models/Badge';
import { loadUserBadges } from './getClaimedBadges';
import { getCliamedCount, loadAllBadges } from './list';

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
  let claimed_count: number = await getCliamedCount(userId);
  let results: any[] = await loadUserBadges(userId, 1, 5, true);
  //const badges = await Badges.find({id: badgeId});
  return [results, claimed_count];
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
