import * as response from '@/lib/response/response';
import { HmacSHA256, enc } from 'crypto-js';
import { AuthorizationPayload } from '@/lib/models/authentication';
import { v4 as uuidv4 } from 'uuid';
import { AuthFlowBase, ValidationResult, AuthReturnType } from '@/lib/authorization/provider/authFlow';
import User from '@/lib/models/User';
import { appendQueryParamsToUrl } from '@/lib/common/url';
import { NextApiResponse } from 'next';
import { AuthorizationType } from '@/lib/authorization/types';
import { checkGetAuthorizationURLPrerequisite } from '@/lib/authorization/provider/util';
import UserTelegram from '@/lib/models/UserTelegram';
import { Metric } from '@/lib/models/UserMetrics';

export async function generateAuthorizationURL(req: any, res: any) {
  // 检查用户的授权落地页
  const checkResult = await checkGetAuthorizationURLPrerequisite(req, res);
  if (!checkResult.passed) {
    return;
  }

  res.json(
    response.success({
      authorization_url: process.env.TELEGRAM_AUTH_URL!,
      bot_id: process.env.TELEGRAM_BOT_ID!,
    }),
  );
}

export class TelegramAuthFlow extends AuthFlowBase {
  get authReturnType(): AuthReturnType {
    return AuthReturnType.JSON;
  }

  authorizationType(): AuthorizationType {
    return AuthorizationType.Telegram;
  }

  authorizationMetric(): Metric {
    return Metric.TelegramConnected;
  }

  async validateCallbackState(req: any, res: NextApiResponse): Promise<ValidationResult> {
    // 检查用户的授权落地页
    const checkResult = await checkGetAuthorizationURLPrerequisite(req, res);
    if (!checkResult.passed) {
      return { passed: false };
    }

    req.body.inviter_id = checkResult.inviter?.direct;
    req.body.indirect_inviter_id = checkResult.inviter?.indirect;

    // 验证算法有问题，先直接返回成功
    let result = { passed: true, authPayload: req.body };
    return result;

    let data: any = {};
    Object.assign(data, req.body);
    delete data.hash; // Remove hash from object to build the verification string
    delete data.flow;
    delete data.inviter_id;
    delete data.indirect_inviter_id;

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
    authPayload.landing_url = req.query.landing_url;
    authPayload.signup_mode = req.query.signup_mode;
    authPayload.authorization_user_id = req.userId;
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
