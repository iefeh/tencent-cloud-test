import { AuthorizationType, OAuthOptions } from '@/lib/authorization/types';
import { OAuthProvider } from '@/lib/authorization/oauth';
import * as response from '@/lib/response/response';
import { AuthorizationFlow, AuthorizationPayload } from '@/lib/models/authentication';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '@/lib/redis/client';
import { AuthFlowBase, ValidationResult, AuthReturnType } from '@/lib/authorization/provider/authFlow';
import { NextApiResponse } from 'next';
import User from '@/lib/models/User';
import { checkGetAuthorizationURLPrerequisite, validateCallbackState } from '@/lib/authorization/provider/util';
import UserGoogle from '@/lib/models/UserGoogle';
import { Metric } from '@/lib/models/UserMetrics';

const googleOAuthOps: OAuthOptions = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  scope: process.env.GOOGLE_AUTH_SCOPE!,
  redirectURI: process.env.GOOGLE_REDIRECT_URL!,
  authEndpoint: process.env.GOOGLE_AUTH_URL!,
  tokenEndpoint: process.env.GOOGLE_TOKEN_URL!,
};
export const googleOAuthProvider = new OAuthProvider(googleOAuthOps);

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
    signup_mode: signup_mode,
  };
  const state = uuidv4();
  await redis.setex(`authorization_state:${AuthorizationType.Google}:${state}`, 60 * 60 * 12, JSON.stringify(payload));

  // 生成授权URL.
  const authorizationUri = googleOAuthProvider.authorizationURL({
    state: state,
  });
  res.json(
    response.success({
      authorization_url: authorizationUri,
    }),
  );
}

export class GoogleAuthFlow extends AuthFlowBase {
  get authReturnType(): AuthReturnType {
    return AuthReturnType.REDIRECT;
  }

  authorizationType(): AuthorizationType {
    return AuthorizationType.Google;
  }

  authorizationMetric(): Metric {
    return Metric.GoogleConnected;
  }

  async validateCallbackState(req: any, res: NextApiResponse): Promise<ValidationResult> {
    return validateCallbackState(AuthorizationType.Google, req, res);
  }

  async getAuthParty(req: any, authPayload: AuthorizationPayload): Promise<any> {
    const { code } = req.query;
    const authToken = await googleOAuthProvider.authenticate({
      code: code as string,
    });

    // 获取绑定用户
    return await googleOAuthProvider.createRequest(authToken).get('https://openidconnect.googleapis.com/v1/userinfo');
  }

  getReconnectCdKey(authParty: any): string {
    return `reconnect_cd:${AuthorizationType.Google}:${authParty.sub}`;
  }

  async queryUserConnectionFromParty(party: any): Promise<any> {
    return await UserGoogle.findOne({ google_id: party.sub, deleted_time: null });
  }

  constructUserConnection(userId: string, authParty: any): any {
    return new UserGoogle({
      user_id: userId,
      google_id: authParty.sub,
      email: authParty.email,
      email_verified: authParty.email_verified,
      given_name: authParty.given_name,
      family_name: authParty.family_name,
      name: authParty.name,
      locale: authParty.locale,
      picture: authParty.picture,
      profile: authParty.profile,
      created_time: Date.now(),
    });
  }

  constructNewUser(authParty: any): any {
    return new User({
      user_id: uuidv4(),
      username: authParty.name,
      avatar_url: authParty.picture,
      created_time: Date.now(),
    });
  }
}

