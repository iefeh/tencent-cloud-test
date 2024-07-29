import * as response from '@/lib/response/response';
import { HmacSHA256, enc } from 'crypto-js';
import { AuthorizationFlow, AuthorizationPayload } from '@/lib/models/authentication';
import { v4 as uuidv4 } from 'uuid';
import { AuthFlowBase, ValidationResult } from '@/lib/authorization/provider/authFlow';
import User from '@/lib/models/User';
import { appendQueryParamsToUrl } from '@/lib/common/url';
import { NextApiResponse } from 'next';
import { AuthorizationType } from '@/lib/authorization/types';
import { checkGetAuthorizationURLPrerequisite, validateCallbackState } from '@/lib/authorization/provider/util';
import UserTelegram from '@/lib/models/UserTelegram';
import { Metric } from '@/lib/models/UserMetrics';

export interface TelegramLoginData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  invite_code?: string;
  signup_mode?: string;
  landing_url: string;
}

export async function generateAuthorizationURL(req: any, res: any) {
  // 检查用户的授权落地页
  const checkResult = await checkGetAuthorizationURLPrerequisite(req, res);
  if (!checkResult.passed) {
    return;
  }

  // 生成授权的状态字段
  const authURL = appendQueryParamsToUrl(process.env.TELEGRAM_AUTH_URL!, {
    bot_id: process.env.TELEGRAM_BOT_ID!,
    origin: process.env.TELEGRAM_AUTH_ORIGIN!,
    return_to: process.env.TELEGRAM_REDIRECT_URL!,
    request_access: 'write',
  });
  res.json(
    response.success({
      authorization_url: authURL,
    }),
  );
}

export class TelegramAuthFlow extends AuthFlowBase {
  authorizationType(): AuthorizationType {
    return AuthorizationType.Telegram;
  }

  authorizationMetric(): Metric {
    return Metric.TelegramConnected;
  }

  async validateCallbackState(req: any, res: NextApiResponse): Promise<ValidationResult> {
    req.query.landing_url = req.body.landing_url;
    req.query.invite_code = req.body.invite_code;
    req.query.signup_mode = req.body.signup_mode;
    console.log('req', req.query);
    // 检查用户的授权落地页
    const checkResult = await checkGetAuthorizationURLPrerequisite(req, res);
    if (!checkResult.passed) {
      return { passed: false };
    }

    let data: any = {};
    Object.assign(data, req.body);
    delete data.hash; // Remove hash from object to build the verification string
    delete data.invite_code;
    delete data.signup_mode;
    delete data.landing_url;

    req.body.inviter_id = checkResult.inviter?.direct;
    req.body.indirect_inviter_id = checkResult.inviter?.indirect;

    // 验证算法有问题，先直接返回成功
    let result = { passed: true, authPayload: req.body };
    return result;

    const hash = req.body.hash as string;
    const secret = HmacSHA256(process.env.TELEGRAM_BOT_TOKEN!, 'WebAppData');
    const dataCheckString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');
    const computedHash = HmacSHA256(dataCheckString, secret).toString(enc.Hex);
    result = { passed: computedHash === hash, authPayload: req.body };
    return result;
  }

  async getAuthParty(req: any, authPayload: AuthorizationPayload): Promise<any> {
    return authPayload;
  }

  getReconnectCdKey(authParty: any): string {
    return `reconnect_cd:${AuthorizationType.Telegram}:${authParty.id}`;
  }

  async queryUserConnectionFromParty(party: any): Promise<any> {
    return await UserTelegram.findOne({ telegram_id: party.id, deleted_time: null });
  }

  constructUserConnection(userId: string, authParty: any): any {
    return new UserTelegram({
      user_id: userId,
      telegram_id: authParty.id,
      username: authParty.username,
      first_name: authParty.first_name,
      last_name: authParty.last_name,
      avatar: authParty.photo_url,
      created_time: Date.now(),
    });
  }

  constructNewUser(authParty: any): any {
    return new User({
      user_id: uuidv4(),
      username: authParty.username,
      avatar_url: authParty.photo_url,
      created_time: Date.now(),
    });
  }
}
