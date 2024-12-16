import * as response from '@/lib/response/response';
import { AuthorizationFlow, AuthorizationPayload } from '@/lib/models/authentication';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '@/lib/redis/client';
import { AuthorizationType, OAuthOptions } from '@/lib/authorization/types';
import { OAuthProvider } from '@/lib/authorization/oauth';
import { AuthFlowBase, ValidationResult, AuthReturnType } from '@/lib/authorization/provider/authFlow';
import { NextApiResponse } from 'next';
import {
  checkGetAuthorizationURLPrerequisite,
  deleteAuthToken,
  saveRotateAuthToken,
  validateCallbackState,
} from '@/lib/authorization/provider/util';
import UserApple from '@/lib/models/UserApple';
import User from '@/lib/models/User';
import OAuthToken from '@/lib/models/OAuthToken';
import logger from '@/lib/logger/winstonLogger';
import { Metric } from '@/lib/models/UserMetrics';
import appleSignin from 'apple-signin-auth';

const appleOAuthOps: OAuthOptions = {
  clientId: process.env.APPLE_CLIENT_ID!,
  clientSecret: appleSignin.getClientSecret({
    clientID: process.env.APPLE_CLIENT_ID!, // Apple Service ID
    teamID: process.env.APPLE_TEAM_ID!,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    // privateKeyPath: process.cwd() + '/src/' + process.env.APPLE_PRIVATE_KEY_PATH!,
    keyIdentifier: process.env.APPLE_PRIVATE_KEY_IDENTIFIER!,
  }),
  scope: process.env.APPLE_AUTH_SCOPE!,
  redirectURI: process.env.APPLE_REDIRECT_URL!,
  authEndpoint: process.env.APPLE_AUTH_URL!,
  tokenEndpoint: process.env.APPLE_TOKEN_URL!,
  enableBasicAuth: true,
  onAccessTokenRefreshed: async (authToken) => {
    logger.debug('apple access token refreshed:', authToken);
    await saveRotateAuthToken(authToken);
  },
  onRefreshTokenExpired: async (authToken) => {
    logger.debug('apple refresh token revoked:', authToken);
    await deleteAuthToken(authToken);
  },
};
export const appleOAuthProvider = new OAuthProvider(appleOAuthOps);

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

  const authorizationUri = appleOAuthProvider.authorizationURL({
    state: state,
    response_mode: 'form_post',
  });
  res.json(
    response.success({
      authorization_url: authorizationUri,
    }),
  );
}

export class AppleAuthFlow extends AuthFlowBase {
  get authReturnType(): AuthReturnType {
    return AuthReturnType.REDIRECT;
  }

  authorizationType(): AuthorizationType {
    return AuthorizationType.Apple;
  }

  authorizationMetric(): Metric {
    return Metric.AppleConnected;
  }

  async validateCallbackState(req: any, res: NextApiResponse): Promise<ValidationResult> {
    return validateCallbackState(AuthorizationType.Apple, req, res, true);
  }

  async getAuthParty(req: any, authPayload: AuthorizationPayload): Promise<any> {
    const code = req.body.code;
    let user = req.body.user;
    const authToken = await appleOAuthProvider.authenticate({
      code: code as string,
    });

    if (!user && !!authToken.id_token) {
      // 用户非首次登录，jwt decode id token
      user = await appleSignin.verifyIdToken(authToken.id_token);
    }

    // 保存用户授权token
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
        platform: AuthorizationType.Apple,
        platform_id: user.email,
        deleted_time: null,
      },
      { $set: userTokenUpdates },
      { upsert: true },
    );
    return user;
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
      username: !!authParty.name
        ? authParty.name.firstName + ' ' + authParty.name.lastName
        : authParty.email.split('@')[0],
      first_name: authParty.name?.firstName,
      last_name: authParty.name?.lastName,
      created_time: Date.now(),
    });
  }

  constructNewUser(authParty: any): any {
    return new User({
      user_id: uuidv4(),
      username: !!authParty.name
        ? authParty.name.firstName + ' ' + authParty.name.lastName
        : authParty.email.split('@')[0],
      avatar_url: process.env.DEFAULT_AVATAR_URL,
      created_time: Date.now(),
    });
  }
}
