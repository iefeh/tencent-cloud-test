import { tr } from 'date-fns/locale';
import { NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

import { AuthorizationType, CaptchaType, SignupPayload } from '@/lib/authorization/types';
import { appendQueryParamsToUrl, appendResponseToUrlQueryParams } from '@/lib/common/url';
import logger from '@/lib/logger/winstonLogger';
import { generateUserSession, generateUserSignupSession } from '@/lib/middleware/session';
import { AuthorizationFlow, AuthorizationPayload } from '@/lib/models/authentication';
import User from '@/lib/models/User';
import UserInvite from '@/lib/models/UserInvite';
import UserMetrics, { incrUserMetric, Metric } from '@/lib/models/UserMetrics';
import {
  NEW_INVITEE_REGISTRATION_MOON_BEAM_DELTA,
  saveNewInviteeRegistrationMoonBeamAudit,
} from '@/lib/models/UserMoonBeamAudit';
import connectToMongoDbDev, { isDuplicateKeyError } from '@/lib/mongodb/client';
import doTransaction from '@/lib/mongodb/transaction';
import { genLoginJWT } from '@/lib/particle.network/auth';
import { redis } from '@/lib/redis/client';
import * as response from '@/lib/response/response';
import * as Sentry from '@sentry/nextjs';

export interface ValidationResult {
  passed: boolean;
  authPayload?: AuthorizationPayload;
}

export enum AuthReturnType {
  REDIRECT = 1,
  JSON = 2,
}

export abstract class AuthFlowBase {
  // 回调方式
  abstract get authReturnType(): AuthReturnType;

  // 校验回调的state
  abstract validateCallbackState(req: any, res: NextApiResponse): Promise<ValidationResult>;

  // 获取授权的第三方用户
  abstract getAuthParty(req: any, authPayload: AuthorizationPayload): Promise<any>;

  // 获取重连的cd键
  abstract getReconnectCdKey(authParty: any): string;

  // 从数据库中查找第三方绑定的用户
  abstract queryUserConnectionFromParty(authParty: any): Promise<any>;

  // 构建用户绑定
  abstract constructUserConnection(userId: string, authParty: any): any;

  // 构建新用户
  abstract constructNewUser(authParty: any): any;

  // 获取授权的类型
  abstract authorizationType(): AuthorizationType;

  // 当前授权关联的指标
  abstract authorizationMetric(): Metric;
}

export function onErrorResponse(authFlow: AuthFlowBase, authPayload: AuthorizationPayload, res: any, err: any) {
  if (authFlow.authReturnType == AuthReturnType.REDIRECT) {
    const landing_url = appendResponseToUrlQueryParams(authPayload.landing_url, err);
    res.redirect(landing_url);
  } else if (authFlow.authReturnType == AuthReturnType.JSON) {
    res.json(err);
  } else {
    res.json(response.serverError());
  }
}

export function onSuccessResponse(
  authFlow: AuthFlowBase,
  authPayload: AuthorizationPayload,
  res: any,
  responseData: any,
) {
  if (authFlow.authReturnType == AuthReturnType.REDIRECT) {
    const landing_url = appendQueryParamsToUrl(authPayload.landing_url, responseData);
    res.redirect(landing_url);
  } else if (authFlow.authReturnType == AuthReturnType.JSON) {
    res.json(response.success(responseData));
  } else {
    res.json(response.serverError());
  }
}

export async function handleAuthCallback(authFlow: AuthFlowBase, req: any, res: any) {
  // 检查当前的回调state，获取state对应的授权负载
  const { passed, authPayload } = await authFlow.validateCallbackState(req, res);
  if (!passed) {
    return;
  }
  if (!authPayload) {
    logger.error(`authPayload not present when validate callback passed from flow:${authFlow}`);
    res.status(500).json(response.serverError());
    return;
  }
  try {
    // 获取当前的授权第三方用户
    const authParty = await authFlow.getAuthParty(req, authPayload);
    if (authPayload.flow == AuthorizationFlow.CONNECT) {
      // 执行用户绑定流程，要求第三方未绑定至任何用户
      await handleUserConnectFlow(authFlow, authPayload, authParty, res);
      return;
    }
    // 默认当前是登录流程，如果用户不存在，则需要创建新的用户与用户绑定
    await handleUserLoginFlow(authFlow, authPayload, authParty, res);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    onErrorResponse(authFlow, authPayload, res, response.serverError());
  }
}

async function handleUserConnectFlow(
  authFlow: AuthFlowBase,
  authPayload: AuthorizationPayload,
  authParty: any,
  res: any,
): Promise<void> {
  // 检查当前是否存在授权cd
  const reconnectCdKey = authFlow.getReconnectCdKey(authParty);
  const canReconnectAt = await redis.get(reconnectCdKey);
  if (canReconnectAt) {
    onErrorResponse(authFlow, authPayload, res, response.connectionCoolingDown(canReconnectAt));
    return;
  }
  const userConnection = await authFlow.queryUserConnectionFromParty(authParty);
  if (userConnection && userConnection.user_id != authPayload.authorization_user_id) {
    // 账号已经绑定到其他用户
    onErrorResponse(authFlow, authPayload, res, response.accountDuplicateBound());
    return;
  }
  // 创建新的用户绑定
  const newUserConnection = authFlow.constructUserConnection(authPayload.authorization_user_id!, authParty);
  const userMetric = authFlow.authorizationMetric();
  try {
    await doTransaction(async (session) => {
      const opts = { session };
      if (userConnection) {
        // 移除历史绑定
        userConnection.deleted_time = newUserConnection.created_time;
        await userConnection.save(opts);
      }
      await newUserConnection.save(opts);
      // 更新用户授权指标
      await UserMetrics.updateOne(
        { user_id: authPayload.authorization_user_id! },
        {
          $set: {
            [userMetric]: 1,
          },
          $setOnInsert: {
            created_time: Date.now(),
          },
        },
        { upsert: true, session: session },
      );
    });
    onErrorResponse(authFlow, authPayload, res, response.success());
  } catch (error: any) {
    if (isDuplicateKeyError(error)) {
      logger.warn('唯一性键冲突：', error);
      onErrorResponse(authFlow, authPayload, res, response.accountDuplicateBound());
      return;
    }
    logger.error(error);
    Sentry.captureException(error);
    onErrorResponse(authFlow, authPayload, res, response.serverError());
  }
}

async function handleUserLoginFlow(
  authFlow: AuthFlowBase,
  authPayload: AuthorizationPayload,
  authParty: any,
  res: any,
): Promise<void> {
  // 检查用户的绑定与登录模式，确认当前触发的流程分支
  let userConnection = await authFlow.queryUserConnectionFromParty(authParty);
  const isNewUser = !userConnection;
  if (isNewUser && authPayload.signup_mode) {
    // 新用户注册确认流程
    await doUserSignupConfirmation(authFlow, authPayload, authParty, res);
    return;
  }
  // 常规用户登录流程
  await doUserLogin(authFlow, authPayload, authParty, userConnection, res);
}

async function doUserLogin(
  authFlow: AuthFlowBase,
  authPayload: AuthorizationPayload,
  authParty: any,
  userConnection: any,
  res: any,
) {
  // 默认当前是登录流程，如果用户不存在，则需要创建新的用户与用户绑定
  const isNewUser = !userConnection;
  if (isNewUser) {
    // 新创建用户与其社交绑定，如果有邀请者，则添加邀请记录与奖励
    const newUser = authFlow.constructNewUser(authParty);
    newUser.moon_beam = !authPayload.virtual && authPayload.inviter_id ? NEW_INVITEE_REGISTRATION_MOON_BEAM_DELTA : 0;
    userConnection = authFlow.constructUserConnection(newUser.user_id, authParty);
    await doTransaction(async (session) => {
      const opts = { session };
      await userConnection.save(opts);
      await newUser.save(opts);
      // 添加邀请记录
      if (authPayload.inviter_id) {
        const invite = new UserInvite({
          user_id: authPayload.inviter_id,
          invitee_id: newUser.user_id,
          virtual: authPayload.virtual,
          created_time: Date.now(),
        });
        await invite.save(opts);
        if (!authPayload.virtual) {
          // 当前用户添加被邀请奖励
          await saveNewInviteeRegistrationMoonBeamAudit(newUser.user_id, authPayload.inviter_id, session);
        }

        // 直接或间接邀请者添加邀请数
        await incrUserMetric(authPayload.inviter_id, Metric.TotalInvitee, 1, session);
        if (authPayload.indirect_inviter_id) {
          await incrUserMetric(authPayload.indirect_inviter_id, Metric.TotalIndirectInvitee, 1, session);
        }
      }
    });
  } else {
    //检查用户是否已经被删除
    const now = Date.now();
    const user = await User.findOne({ user_id: userConnection.user_id });
    // 用户申请删除已经过了90天, 禁止登录
    if (user.selfdestruct_request_time && user.selfdestruct_request_time + 1000 * 60 * 60 * 24 * 90 < now) {
      return res.status(500).json(response.userSelfDestructed());
    }
  }
  // 执行用户登录
  const userId = userConnection.user_id;
  const token = await generateUserSession(userId);
  const loginSuccess = response.success();
  onSuccessResponse(authFlow, authPayload, res, {
    code: loginSuccess.code,
    msg: loginSuccess.msg,
    token: token,
    particle_jwt: genLoginJWT(userId),
    is_new_user: isNewUser,
  });
}

async function doUserSignupConfirmation(
  authFlow: AuthFlowBase,
  authPayload: AuthorizationPayload,
  authParty: any,
  res: any,
) {
  const newUser = authFlow.constructNewUser(authParty);
  const userConnection = authFlow.constructUserConnection(newUser.user_id, authParty);
  // 构建注册的负载信息
  const payload: SignupPayload = {
    authorization_type: authFlow.authorizationType(),
    user: newUser,
    third_party_user: userConnection,
  };
  if (authPayload.inviter_id) {
    payload.invite = {
      user_id: authPayload.inviter_id,
      invitee_id: newUser.user_id,
      virtual: authPayload.virtual,
      created_time: Date.now(),
    };
    payload.indirect_inviter_id = authPayload.indirect_inviter_id;
  }
  // 生成二次确认的注册token
  const token = await generateUserSignupSession(payload);
  const signupConfirmation = response.signupConfirmation();
  onSuccessResponse(authFlow, authPayload, res, {
    code: signupConfirmation.code,
    msg: signupConfirmation.msg,
    signup_cred: token,
  });
}
