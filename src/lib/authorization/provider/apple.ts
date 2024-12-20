import * as response from '@/lib/response/response';
import { AuthorizationFlow, AuthorizationPayload } from '@/lib/models/authentication';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '@/lib/redis/client';
import { AuthorizationType } from '@/lib/authorization/types';
import { AuthFlowBase, ValidationResult, AuthReturnType } from '@/lib/authorization/provider/authFlow';
import { NextApiResponse } from 'next';
import { checkGetAuthorizationURLPrerequisite, validateCallbackState } from '@/lib/authorization/provider/util';
import UserApple from '@/lib/models/UserApple';
import User from '@/lib/models/User';
import { Metric } from '@/lib/models/UserMetrics';
import appleSignin from 'apple-signin-auth';

export async function generateAuthorizationURL(req: any, res: any) {
  // 检查用户的授权落地页
  const { landing_url, signup_mode } = req.query;
  const checkResult = await checkGetAuthorizationURLPrerequisite(req, res);
  if (!checkResult.passed) {
    return;
  }

  // 生成授权的状态字段
  const currFlow = req.userId ? AuthorizationFlow.CONNECT : AuthorizationFlow.LOGIN;
  const payload: AuthorizationPayload = {
    landing_url: landing_url,
    flow: currFlow,
    authorization_user_id: req.userId,
    inviter_id: checkResult.inviter?.direct,
    indirect_inviter_id: checkResult.inviter?.indirect,
    virtual: checkResult.inviter?.virtual,
    signup_mode: signup_mode,
  };
  const state = uuidv4();
  await redis.setex(`authorization_state:${AuthorizationType.Apple}:${state}`, 60 * 60 * 12, JSON.stringify(payload));

  res.json(
    response.success({
      client_id: process.env.APPLE_CLIENT_ID!,
      scope: process.env.APPLE_AUTH_SCOPE!,
      redirect_uri: process.env.APPLE_REDIRECT_URL!,
      state: state,
    }),
  );
}

export class AppleAuthFlow extends AuthFlowBase {
  get authReturnType(): AuthReturnType {
    return AuthReturnType.JSON;
  }

  authorizationType(): AuthorizationType {
    return AuthorizationType.Apple;
  }

  authorizationMetric(): Metric {
    return Metric.AppleConnected;
  }

  async validateCallbackState(req: any, res: NextApiResponse): Promise<ValidationResult> {
    const checkResult = await checkGetAuthorizationURLPrerequisite(req, res);
    if (!checkResult.passed) {
      return { passed: false };
    }

    req.body.inviter_id = checkResult.inviter?.direct;
    req.body.indirect_inviter_id = checkResult.inviter?.indirect;
    req.body.virtual = checkResult.inviter?.virtual;

    let result = { passed: true, authPayload: req.body };
    return result;
  }

  async getAuthParty(req: any, authPayload: AuthorizationPayload): Promise<any> {
    let { id_token, user } = req.body;

    if ((!user || user === '') && !!id_token) {
      // 用户非首次登录，jwt decode id token
      user = await appleSignin.verifyIdToken(id_token, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: true,
      });
    } else if (typeof user === 'string') {
      // 用户首次登录，user信息是JSON字符串
      user = JSON.parse(user);
    } // 否则user是JSON Object

    authPayload.landing_url = req.query.landing_url;
    authPayload.signup_mode = req.query.signup_mode;
    authPayload.authorization_user_id = req.userId;

    return Object.assign({}, authPayload, user);
  }

  getReconnectCdKey(authParty: any): string {
    return `reconnect_cd:${AuthorizationType.Apple}:${authParty.email}`;
  }

  async queryUserConnectionFromParty(party: any): Promise<any> {
    return await UserApple.findOne({ apple_id: party.email, deleted_time: null });
  }

  constructUserConnection(userId: string, authParty: any): any {
    return new UserApple({
      user_id: userId,
      apple_id: authParty.email,
      username: !!authParty.name ? authParty.name.firstName + ' ' + authParty.name.lastName : authParty.email,
      first_name: authParty.name?.firstName,
      last_name: authParty.name?.lastName,
      created_time: Date.now(),
    });
  }

  constructNewUser(authParty: any): any {
    return new User({
      user_id: uuidv4(),
      username: !!authParty.name ? authParty.name.firstName + ' ' + authParty.name.lastName : authParty.email,
      avatar_url: process.env.DEFAULT_AVATAR_URL,
      created_time: Date.now(),
    });
  }
}
