import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { redis } from '@/lib/redis/client';
import { UserContextRequest } from '@/lib/middleware/auth';
import doTransaction from '@/lib/mongodb/transaction';
import UserInvite from '@/lib/models/UserInvite';
import User from '@/lib/models/User';
import { AuthorizationType, SignupPayload } from '@/lib/authorization/types';
import UserDiscord from '@/lib/models/UserDiscord';
import UserGoogle from '@/lib/models/UserGoogle';
import UserSteam from '@/lib/models/UserSteam';
import UserTwitter from '@/lib/models/UserTwitter';
import UserTelegram from '@/lib/models/UserTelegram';
import UserWallet from '@/lib/models/UserWallet';
import { generateUserSession } from '@/lib/middleware/session';
import { genLoginJWT } from '@/lib/particle.network/auth';
import { isDuplicateKeyError } from '@/lib/mongodb/client';
import { errorInterceptor } from '@/lib/middleware/error';
import { timeoutInterceptor } from '@/lib/middleware/timeout';
import logger from '@/lib/logger/winstonLogger';
import {
  NEW_INVITEE_REGISTRATION_MOON_BEAM_DELTA,
  saveNewInviteeRegistrationMoonBeamAudit,
} from '@/lib/models/UserMoonBeamAudit';
import { Metric, incrUserMetric } from '@/lib/models/UserMetrics';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), timeoutInterceptor()).post(async (req, res) => {
  const { signup_cred } = req.body;
  if (!signup_cred) {
    return res.json(response.invalidParams());
  }
  // 获取用户的注册信息
  const payloadStr = await redis.get(`user_signup_confirmation:${signup_cred}`);
  if (!payloadStr) {
    return res.json(response.signupConfirmationExpired());
  }
  const payload = JSON.parse(payloadStr) as SignupPayload;
  // 保存用户信息
  try {
    // moon_beam逻辑未用到，并且因为有虚拟KOL的逻辑，这里不好处理，注释掉
    // payload.user.moon_beam = payload.invite ? NEW_INVITEE_REGISTRATION_MOON_BEAM_DELTA : 0;
    await doTransaction(async function (session) {
      const opts = { session };
      const user = new User(payload.user);
      await user.save(opts);
      if (payload.third_party_user) {
        let userConnection;
        switch (payload.authorization_type) {
          case AuthorizationType.Discord:
            userConnection = new UserDiscord(payload.third_party_user);
            break;
          case AuthorizationType.Google:
            userConnection = new UserGoogle(payload.third_party_user);
            break;
          case AuthorizationType.Steam:
            userConnection = new UserSteam(payload.third_party_user);
            break;
          case AuthorizationType.Twitter:
            userConnection = new UserTwitter(payload.third_party_user);
            break;
          case AuthorizationType.Telegram:
            userConnection = new UserTelegram(payload.third_party_user);
            break;
          case AuthorizationType.Wallet:
            userConnection = new UserWallet(payload.third_party_user);
            break;
          default:
            throw new Error('unimplemented authorization type.');
        }
        await userConnection.save(opts);
      }
      if (payload.invite) {
        const invite = new UserInvite(payload.invite);
        await invite.save(opts);
        if (!payload.invite.virtual) {
          await saveNewInviteeRegistrationMoonBeamAudit(payload.user.user_id, payload.invite.user_id, session);
        }
      }
    });
    await incrUserMetric(payload.invite.user_id, Metric.TotalInvitee, 1, null);
    if (payload.indirect_inviter_id) {
      await incrUserMetric(payload.indirect_inviter_id, Metric.TotalIndirectInvitee, 1, null);
    }
  } catch (e) {
    if (isDuplicateKeyError(e)) {
      logger.warn(e);
      res.json(response.signupConfirmationExpired());
      return;
    }
    throw e;
  }
  // 删除注册凭证
  await redis.del(`user_signup_confirmation:${signup_cred}`);
  // 生成登录token
  const token = await generateUserSession(payload.user.user_id);
  res.json(
    response.success({
      token: token,
      particle_jwt: genLoginJWT(payload.user.user_id),
    }),
  );
});

// this will run if none of the above matches
router.all((req, res) => {
  res.status(405).json({
    error: 'Method not allowed',
  });
});

export default router.handler();
