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
import UserTwitter from '@/lib/models/UserTwitter';
import User from '@/lib/models/User';
import OAuthToken from '@/lib/models/OAuthToken';
import logger from '@/lib/logger/winstonLogger';
import { Metric } from '@/lib/models/UserMetrics';
import { sendTwitterFollowerCountRefreshMessage } from '@/lib/kafka/client';

const twitterOAuthOps: OAuthOptions = {
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  scope: process.env.TWITTER_AUTH_SCOPE!,
  redirectURI: process.env.TWITTER_REDIRECT_URL!,
  authEndpoint: process.env.TWITTER_AUTH_URL!,
  tokenEndpoint: process.env.TWITTER_TOKEN_URL!,
  enableBasicAuth: true,
  onAccessTokenRefreshed: async (authToken) => {
    logger.debug('twitter access token refreshed:', authToken);
    await saveRotateAuthToken(authToken);
  },
  onRefreshTokenExpired: async (authToken) => {
    logger.debug('twitter refresh token revoked:', authToken);
    await deleteAuthToken(authToken);
  },
};
export const twitterOAuthProvider = new OAuthProvider(twitterOAuthOps);

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
    code_challenge: uuidv4(),
    authorization_user_id: req.userId,
    inviter_id: checkResult.inviter?.direct,
    indirect_inviter_id: checkResult.inviter?.indirect,
    signup_mode: signup_mode,
  };
  const state = uuidv4();
  await redis.setex(`authorization_state:${AuthorizationType.Twitter}:${state}`, 60 * 60 * 12, JSON.stringify(payload));

  // twitter授权必须要传递code_challenge，并且在获取访问token时回传.
  const authorizationUri = twitterOAuthProvider.authorizationURL({
    state: state,
    code_challenge: payload.code_challenge!,
    code_challenge_method: 'plain',
  });
  res.json(
    response.success({
      authorization_url: authorizationUri,
    }),
  );
}

export class TwitterAuthFlow extends AuthFlowBase {
  get authReturnType(): AuthReturnType {
    return AuthReturnType.REDIRECT;
  }

  authorizationType(): AuthorizationType {
    return AuthorizationType.Twitter;
  }

  authorizationMetric(): Metric {
    return Metric.TwitterConnected;
  }

  async validateCallbackState(req: any, res: NextApiResponse): Promise<ValidationResult> {
    return validateCallbackState(AuthorizationType.Twitter, req, res);
  }

  async getAuthParty(req: any, authPayload: AuthorizationPayload): Promise<any> {
    const { code } = req.query;
    const authToken = await twitterOAuthProvider.authenticate({
      code: code as string,
      code_verifier: authPayload.code_challenge,
    });

    // 获取绑定用户
    const data: any = await twitterOAuthProvider
      .createRequest(authToken)
      .get(
        'https://api.twitter.com/2/users/me?expansions=pinned_tweet_id&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified',
      );
    const connection = data.data;
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
        platform: AuthorizationType.Twitter,
        platform_id: connection.id,
        deleted_time: null,
      },
      { $set: userTokenUpdates },
      { upsert: true },
    );
    //发送更新用户推特粉丝数消息
    const ut = await UserTwitter.findOne({ twitter_id: connection.id });
    if (ut) {
      await sendTwitterFollowerCountRefreshMessage(ut.user_id);
    }
    return connection;
  }

  getReconnectCdKey(authParty: any): string {
    return `reconnect_cd:${AuthorizationType.Twitter}:${authParty.id}`;
  }

  async queryUserConnectionFromParty(party: any): Promise<any> {
    return await UserTwitter.findOne({ twitter_id: party.id, deleted_time: null });
  }

  constructUserConnection(userId: string, authParty: any): any {
    return new UserTwitter({
      user_id: userId,
      twitter_id: authParty.id,
      description: authParty.description,
      verified: authParty.verified,
      username: authParty.username,
      name: authParty.name,
      url: authParty.url,
      protected: authParty.protected,
      profile_image_url: authParty.profile_image_url,
      location: authParty.location,
      register_time: authParty.register_time,
      public_metrics: authParty.public_metrics,
      created_time: Date.now(),
    });
  }

  constructNewUser(authParty: any): any {
    return new User({
      user_id: uuidv4(),
      username: authParty.name,
      avatar_url: authParty.profile_image_url,
      created_time: Date.now(),
    });
  }
}
