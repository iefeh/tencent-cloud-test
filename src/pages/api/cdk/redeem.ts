import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import doTransaction from '@/lib/mongodb/transaction';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import CDK, { getCDKInfo, CDKRewardType } from '@/lib/models/CDK';
import { errorInterceptor } from '@/lib/middleware/error';
import UserMoonBeamAudit, { UserMoonBeamAuditType } from '@/lib/models/UserMoonBeamAudit';
import { try2AddUsers2MBLeaderboard } from '@/lib/redis/moonBeamLeaderboard';
import User from '@/lib/models/User';
import CDKRedeemRecord from '@/lib/models/CDKRedeemRecord';
import Badges, { RequirementType } from '@/lib/models/Badge';
import Whitelist from '@/lib/models/Whitelist';
import { WhitelistEntityType } from '@/lib/quests/types';
import { redis } from '@/lib/redis/client';
import UserNotifications from '@/lib/models/UserNotifications';
import { generateUUID } from 'three/src/math/MathUtils';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const { cdk } = req.query;

  if (!cdk) {
    res.json(response.invalidParams());
    return;
  }
  const userId = req.userId!;
  const redeemLock = `redeem_cdk_lock:${cdk}:${userId}`;
  const locked = await redis.set(redeemLock, Date.now(), 'EX', 60, 'NX');
  if (!locked) {
    return response.success({
      result: 'Redeem is under a waiting period, please try again later.',
    });
  }
  try {
    let success: boolean = false;
    //查询CDK信息
    const cdkTemp = String(cdk);

    const cdkInfo = await getCDKInfo(cdkTemp, userId);


    //CDK不存在
    if (!cdkInfo) {
      res.json(
        response.notFound({
          success: success,
          msg: 'CDKey not found.',
        }),
      );
      return;
    }
    //CDK未启用
    if (!cdkInfo.template.active) {
      res.json(
        response.invalidParams({
          success: success,
          msg: 'CDKey inactive.',
        }),
      );
      return;
    }
    //CDK未启用
    if (cdkInfo.expired_time < Date.now()) {
      res.json(
        response.invalidParams({
          success: success,
          msg: 'CDKey expired.',
        }),
      );
      return;
    }
    //是否已领取
    if (cdkInfo.redeem_record.length > 0) {
      res.json(
        response.invalidParams({
          success: success,
          msg: 'CDKey already claimed.',
        }),
      );
      return;
    }
    //是否仍可领取
    if (cdkInfo.template.max_redeem_count === 0 || cdkInfo.max_redeem_count > cdkInfo.current_redeem_count) {
      //构建CDK升级数据

      await redeemCDK(cdkInfo, userId).catch((error: Error) => {
        console.log(error);
        res.json(
          response.success({
            success: false,
            msg: 'Redeem fail. Maybe a CDKey for the same channel has been redeemed.',
          }),
        );
        return;
      });

      success = true;
      res.json(
        response.success({
          success: success,
          msg: 'Redeem success.',
          reward: cdkInfo.template.rewards,
        }),
      );
    } else {
      res.json(
        response.invalidParams({
          msg: 'CDKey redemption has reached the maximum limitation.',
        }),
      );
    }
  } finally {
    await redis.del(redeemLock);
  }
});

async function redeemCDK(cdkInfo: any, userId: string): Promise<any> {
  //构建领取记录
  let redeemRecord: any = new CDKRedeemRecord({
    cdk: cdkInfo.cdk, //CDK
    redeem_user_id: userId, //兑换人
    redeem_taint: [`user_id:${userId},cdk:${cdkInfo.cdk}`], //兑换污点
    redeem_time: Date.now(),
  });
  //若相同渠道的CDK不允许重复领取，则修改taint.
  if (!cdkInfo.channel.repeat_claimable) {
    redeemRecord.redeem_taint = [`user_id:${userId},channel_id:${cdkInfo.channel.id}`];
  }

  const result = await doTransaction(async (session) => {
    //保存领取记录
    for (let reward of cdkInfo.template.rewards) {
      switch (reward.type) {
        case CDKRewardType.MoonBeam:
          await redeemMoonBeamReward(userId, cdkInfo.cdk, session, reward);
          break;
        case CDKRewardType.Badge:
          await redeemBadgeReward(userId, cdkInfo.cdk, session, reward);
          if (reward.alert) {
            await new UserNotifications({
              user_id: userId,
              notification_id: generateUUID(),
              content: reward.alert,
              link: '',
              //创建时间
              created_time: Date.now(),
            }).save({ session: session });
          }
          break;
      }
    }

    await CDKRedeemRecord.insertMany([redeemRecord], { session: session });

    //CDK领取人数量加1
    await CDK.updateOne({ cdk: cdkInfo.cdk }, { $inc: { current_redeem_count: 1 } }, { session: session });
  });
}

async function redeemMoonBeamReward(userId: string, cdk: string, session: any, reward: any) {
  const taint: string = `user_id:${userId},cdk:${cdk}`;
  await UserMoonBeamAudit.insertMany(
    [
      {
        user_id: userId,
        type: UserMoonBeamAuditType.CDK,
        moon_beam_delta: reward.amount,
        reward_taint: taint,
        corr_id: cdk,
        created_time: Date.now(),
      },
    ],
    { session: session },
  );

  //更新用户moonbeam数据
  await User.updateOne({ user_id: userId }, { $inc: { moon_beam: reward.amount } }, { session: session });
  await try2AddUsers2MBLeaderboard(userId);
}

async function redeemBadgeReward(userId: string, cdk: string, session: any, reward: any) {
  const badge = await Badges.findOne({ id: reward.badge_id });
  //徽章不存在
  if (!badge) {
    throw new Error('Badge not exists.');
  }
  let series: any;
  for (let s of badge.series.keys()) {
    series = badge.series.get(s);
    break;
  }
  if (!series) {
    throw new Error('Badge series not exists.');
  }

  //检测要求
  let whitelistRequirement: any;
  for (let r of series.requirements) {
    if (r.type === RequirementType.Whitelist) {
      whitelistRequirement = r;
      break;
    }
  }
  //判断是否为白名单徽章
  if (!whitelistRequirement) {
    throw new Error('Badge type is not whitelist.');
  }
  //判断用户是否已在白名单中
  const whitelist: any = await Whitelist.findOne({
    whitelist_id: whitelistRequirement.properties.whitelist_id,
    whitelist_entity_type: WhitelistEntityType.UserId,
    whitelist_entity_id: userId
  })

  if (!whitelist) {
    //将用户添加至白名单中
    await Whitelist.insertMany(
      [
        {
          whitelist_id: whitelistRequirement.properties.whitelist_id,
          whitelist_entity_type: WhitelistEntityType.UserId,
          whitelist_entity_id: userId,
          created_time: Date.now(),
        },
      ],
      { session: session },
    );
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
