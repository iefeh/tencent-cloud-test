import { AuthorizationType, OAuthOptions } from '@/lib/authorization/types';
import { OAuthProvider } from '@/lib/authorization/oauth';
import * as response from '@/lib/response/response';
import { AuthorizationFlow, AuthorizationPayload } from '@/lib/models/authentication';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '@/lib/redis/client';
import { AuthFlowBase, ValidationResult, AuthReturnType } from '@/lib/authorization/provider/authFlow';
import { NextApiResponse } from 'next';
import OAuthToken from '@/lib/models/OAuthToken';
import User from '@/lib/models/User';
import {
  checkGetAuthorizationURLPrerequisite,
  deleteAuthToken,
  saveRotateAuthToken,
  validateCallbackState,
} from '@/lib/authorization/provider/util';
import UserDiscord from '@/lib/models/UserDiscord';
import logger from '@/lib/logger/winstonLogger';
import { Metric } from '@/lib/models/UserMetrics';

const discordOAuthOps: OAuthOptions = {
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  scope: process.env.DISCORD_AUTH_SCOPE!,
  redirectURI: process.env.DISCORD_REDIRECT_URL!,
  authEndpoint: process.env.DISCORD_AUTH_URL!,
  tokenEndpoint: process.env.DISCORD_TOKEN_URL!,
  enableBasicAuth: true,
  onAccessTokenRefreshed: async (authToken) => {
    logger.debug('discord access token refreshed:', authToken);
    await saveRotateAuthToken(authToken);
  },
  onRefreshTokenExpired: async (authToken) => {
    logger.debug('discord refresh token revoked:', authToken);
    await deleteAuthToken(authToken);
  },
};
export const discordOAuthProvider = new OAuthProvider(discordOAuthOps);

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
    indirect_virtual: checkResult.inviter?.indirectVirtual,
    signup_mode: signup_mode,
  };
  const state = uuidv4();
  await redis.setex(`authorization_state:${AuthorizationType.Discord}:${state}`, 60 * 60 * 12, JSON.stringify(payload));

  // 生成授权地址.
  const authorizationUri = discordOAuthProvider.authorizationURL({
    state: state,
  });
  res.json(
    response.success({
      authorization_url: authorizationUri,
    }),
  );
}

export class DiscordAuthFlow extends AuthFlowBase {
  get authReturnType(): AuthReturnType {
    return AuthReturnType.REDIRECT;
  }

  authorizationType(): AuthorizationType {
    return AuthorizationType.Discord;
  }

  authorizationMetric(): Metric {
    return Metric.DiscordConnected;
  }

  async validateCallbackState(req: any, res: NextApiResponse): Promise<ValidationResult> {
    return validateCallbackState(AuthorizationType.Discord, req, res);
  }

  async getAuthParty(req: any, authPayload: AuthorizationPayload): Promise<any> {
    const { code } = req.query;
    const authToken = await discordOAuthProvider.authenticate({
      code: code,
    });
    // 获取绑定用户
    const connection: any = await discordOAuthProvider
      .createRequest(authToken)
      .get('https://discord.com/api/users/@me');
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
        platform: AuthorizationType.Discord,
        platform_id: connection.id,
        deleted_time: null,
      },
      { $set: userTokenUpdates },
      { upsert: true },
    );
    return connection;
  }

  getReconnectCdKey(authParty: any): string {
    return `reconnect_cd:${AuthorizationType.Discord}:${authParty.id}`;
  }

  async queryUserConnectionFromParty(party: any): Promise<any> {
    return await UserDiscord.findOne({ discord_id: party.id, deleted_time: null });
  }

  constructUserConnection(userId: string, authParty: any): any {
    return new UserDiscord({
      user_id: userId,
      discord_id: authParty.id,
      username: authParty.username,
      global_name: authParty.global_name,
      avatar: this.discordAvatarURL(authParty),
      avatar_decoration: authParty.avatar_decoration,
      public_flags: authParty.public_flags,
      premium_type: authParty.premium_type,
      flags: authParty.flags,
      banner: authParty.banner,
      locale: authParty.locale,
      email: authParty.email,
      verified: authParty.verified,
      mfa_enabled: authParty.mfa_enabled,
      created_time: Date.now(),
    });
  }

  discordAvatarURL(authParty: any, size: string = ''): string {
    const endpointDefaultUserAvatar = (discriminator: string) =>
      `https://cdn.discordapp.com/embed/avatars/${parseInt(discriminator) % 5}.png`;
    const endpointUserAvatar = (id: string, avatar: string) => `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
    const endpointUserAvatarAnimated = (id: string, avatar: string) =>
      `https://cdn.discordapp.com/avatars/${id}/${avatar}.gif`;

    let url: string;

    if (!authParty.avatar) {
      url = endpointDefaultUserAvatar(authParty.discriminator);
    } else if (authParty.avatar.startsWith('a_')) {
      url = endpointUserAvatarAnimated(authParty.id, authParty.avatar);
    } else {
      url = endpointUserAvatar(authParty.id, authParty.avatar);
    }

    if (size) {
      url += `?size=${size}`;
    }
    return url;
  }

  constructNewUser(authParty: any): any {
    return new User({
      user_id: uuidv4(),
      username: authParty.username,
      avatar_url: this.discordAvatarURL(authParty),
      created_time: Date.now(),
    });
  }
}
