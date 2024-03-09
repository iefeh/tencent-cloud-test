import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { maybeAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBadges from '@/lib/models/UserBadges';
import doTransaction from '@/lib/mongodb/transaction';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).post(async (req, res) => {
  let userId = req.userId;
  userId = '4fa8b6f9-d296-4e63-af85-19ce2d9c2cfa';

  //判断用户是否登录
  if (!userId) {
    res.json(response.unauthorized());
    return;
  }

  //保存所有徽章的穿戴信息
  const modifiedCount = await saveAllWearInfo(userId, req.body);
  res.json(
    response.success({
      modifiedCount: modifiedCount,
    }),
  );
});

async function saveAllWearInfo(userId: string, wearInfos: any[]): Promise<any> {
  const now = Date.now();
  let modifiedCount = 0;
  await doTransaction(async (session) => {
    //取消当前穿戴的所有徽章
    await UserBadges.updateMany({ user_id: userId }, { display: false, updated_time: now });

    //保存用户所有徽章穿戴信息
    for (let c of wearInfos) {
      let r = await UserBadges.updateOne(
        { user_id: userId, badge_id: c.badge_id },
        {
          $set: {
            display: c.display,
            display_order: c.display_order,
            updated_time: now,
          },
        },
        { upsert: true, session: session },
      );
      modifiedCount += r.modifiedCount;
    }
  });
  return modifiedCount;
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
