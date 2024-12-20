import * as response from '@/lib/response/response';
import { redis } from '@/lib/redis/client';
import { AuthorizationPayload } from '@/lib/models/authentication';
import { appendQueryParamsToUrl } from '@/lib/common/url';
import { AuthorizationType, AuthToken } from '@/lib/authorization/types';
import OAuthToken from '@/lib/models/OAuthToken';
import axios from 'axios';
import getMongoConnection from '@/lib/mongodb/client';
import { getInviteRelationshipFromDirectInviteCode, inviteRelationship } from '@/lib/common/inviter';

export async function checkGetAuthorizationURLPrerequisite(
  req: any,
  res: any,
): Promise<{ passed: boolean; inviter?: inviteRelationship | null }> {
  // 检查用户的授权落地页
  const { landing_url, invite_code, signup_mode } = req.query;
  if (!landing_url) {
    res.json(response.invalidParams());
    return { passed: false };
  }
  if (signup_mode && signup_mode !== 'enabled') {
    res.json(response.invalidParams());
    return { passed: false };
  }
  // 检查注册邀请码
  await getMongoConnection();
  let inviter: inviteRelationship | null = null;
  // 确保当前是在登录，即用户一定不存在.
  if (!req.userId && invite_code) {
    inviter = await getInviteRelationshipFromDirectInviteCode(invite_code);
    if (!inviter) {
      res.json(response.unknownInviteCode());
      return { passed: false };
    }
  }
  return { passed: true, inviter: inviter };
}

export async function validateCallbackState(
  authType: AuthorizationType,
  req: any,
  res: any,
): Promise<{ passed: boolean; authPayload?: AuthorizationPayload }> {
  const { state, error, code } = req.method === 'POST' ? req.body : req.query;
  if (!state) {
    console.log('callback state not found');
    res.json(response.notFound());
    return { passed: false };
  }
  const stateVal = await redis.get(`authorization_state:${authType}:${state}`);
  if (!stateVal) {
    res.json(response.notFound());
    return { passed: false };
  }
  const authPayload = JSON.parse(stateVal) as AuthorizationPayload;
  if (error) {
    if (error.includes('access_denied') || error.includes('user_cancelled_authorize')) {
      const landing_url = appendQueryParamsToUrl(authPayload.landing_url, response.authorizationDenied());
      res.redirect(landing_url);
      return { passed: false, authPayload: authPayload };
    }
    console.error(error);
    const landing_url = appendQueryParamsToUrl(authPayload.landing_url, response.serverError());
    res.redirect(landing_url);
    return { passed: false, authPayload: authPayload };
  }
  return { passed: true, authPayload: authPayload };
}

// 保存轮换的授权token，注意这个auth token中携带有token归属信息，慎用该函数
export async function saveRotateAuthToken(authToken: AuthToken) {
  const now = Date.now();
  const userTokenUpdates = {
    token_type: authToken.token_type,
    access_token: authToken.access_token,
    refresh_token: authToken.refresh_token,
    expires_in: authToken.expires_in,
    expire_time: now + authToken.expires_in! * 1000,
    created_time: now,
    updated_time: now,
  };
  await OAuthToken.findOneAndUpdate(
    {
      platform: authToken.platform,
      platform_id: authToken.platform_id,
      deleted_time: null,
    },
    { $set: userTokenUpdates },
    { upsert: true },
  );
}

export async function deleteAuthToken(authToken: AuthToken) {
  await OAuthToken.updateOne(
    {
      platform: authToken.platform,
      platform_id: authToken.platform_id,
      deleted_time: null,
    },
    { deleted_time: Date.now() },
  );
}

// 检查是否报错是否为discord无效授权的错误
export function isDiscordAuthRevokedError(error: any): boolean {
  if (!error) {
    return false;
  }
  if (!axios.isAxiosError(error)) {
    return false;
  }
  if (!error.response) {
    return false;
  }
  const status = error.response.status;
  if (status != 400) {
    return false;
  }
  const responseData = error.response.data;
  return responseData.error == 'invalid_grant';
}

export function isDiscordRateLimitError(error: any): { is: boolean; resetAfter?: number } {
  if (!error) {
    return { is: false };
  }
  if (!axios.isAxiosError(error)) {
    return { is: false };
  }
  if (!error.response) {
    return { is: false };
  }
  const status = error.response.status;
  if (status != 429) {
    return { is: false };
  }
  const resetAfter = error.response.headers['x-ratelimit-reset-after'];
  return { is: true, resetAfter: resetAfter };
}
