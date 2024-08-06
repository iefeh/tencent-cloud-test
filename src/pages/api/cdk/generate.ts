import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { maybeAuthInterceptor, mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import CDK, { ICDK } from '@/lib/models/CDK';
import { generateUUID } from 'three/src/math/MathUtils';
import CDKChannel, { ICDKChannel } from '@/lib/models/CDKChannel';
import CDKTemplate, { ICDKTemplate } from '@/lib/models/CDKTemplate';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {

  const now = 1721989140000;// 创建时间
  const count = 90;// 创建个数
  const prefix = 'AGLABKL11DTPP100GS1';

  const maxRedeemCount = 1;// 最大可领取次数

  const expiredTime = 1727711999000;
  await generateCDK(now, count, prefix, maxRedeemCount, expiredTime);

  res.json(response.success());
  return;
});

async function generateCDK(createdTime: number, count: number, prefix: string, maxRedeemCount: number, expiredTime: number): Promise<void> {
  // 保存 channel
  const channel: ICDKChannel = new CDKChannel();
  channel.id = generateUUID();
  channel.name = '';
  channel.repeat_claimable = false;
  channel.prefix = prefix;
  channel.remark = '';
  channel.created_time = createdTime;
  channel.updated_time = createdTime;
  await channel.save();

  // 保存模板
  const template: ICDKTemplate = new CDKTemplate();
  template.id = generateUUID();
  template.channel_id = channel.id;
  template.description = '';
  template.rewards = [
    // {
    //   "type": "moon_beam",
    //   "image_url": "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/campaign/reward/moonbeam/small.png",
    //   "amount": 50,
    //   "description": "MOON BEAMS"
    // },
    //  {
    //   "type": "lottery_ticket",
    //   "image_url": "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lucky_draw/ticket/img.png",
    //   "amount": 1,
    //   "description": "LOTTERY TICKETS"
    // },
    {
      "type": "premium_pass",
      "season_id": 1,
      "description": "PREMIUM PASS",
      "amount": 1
    }
  ];
  template.active = true;
  template.created_time = createdTime;
  await template.save();

  let cdk: ICDK;
  let CDKs = [];
  for (let i = 0; i < count; i++) {
    cdk = new CDK({
      id: generateUUID(),//CDK id
      template_id: "19958a31-32d4-4140-8ba7-dcf761296107",//template.id,//CDK模板ID
      cdk: prefix + "-xxxx-xxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 36 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(36).toUpperCase();
      }),//CDK显示内容
      created_time: createdTime,//创建时间
      expired_time: expiredTime,//过期时间
      max_redeem_count: maxRedeemCount,
      current_redeem_count: 0,
    });
    CDKs.push(cdk);
  }
  await CDK.insertMany(CDKs);

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
