import OAuth2Client from "@/lib/models/OAuth2Client";
import OAuth2Token from "@/lib/models/OAuth2Token";
import OAuth2AuthorizationCode from "@/lib/models/OAuth2AuthorizationCode";
import User from "@/lib/models/User";
import * as jwt from "jsonwebtoken";

const oauth2Model = {
  saveToken: async function (token: any, client: any, user: any) {
  // 保存已生成的token, 如存在已有的token则直接覆盖
    let access_token = await OAuth2Token.findOne({ user_id: user.user_id, client_id: client.id});
    if (access_token) {
      access_token.access_token = token.accessToken;
      access_token.access_token_expires_at = token.accessTokenExpiresAt;
      access_token.scope = token.scope;
      await access_token.save();
    }
    else {
      const newToken = new OAuth2Token({
        user_id: user.user_id,
        client_id: client.id,
        access_token: token.accessToken,
        access_token_expires_at: token.accessTokenExpiresAt,
        scope: token.scope,
      });
      await newToken.save();
    } 
    return {
        user: user,
        client: client,
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        scope: token.scope,
    };
  },

  saveAuthorizationCode: async function (code: any, client: any, user: any) {
  // 保存已生成的授权码，如存在已有的授权码则直接覆盖
    let authorization_code = await OAuth2AuthorizationCode.findOne({ user_id: user.user_id, client_id: client.id});
    if (authorization_code) {
      authorization_code.authorization_code = code.authorizationCode;
      authorization_code.expires_at = code.expiresAt;
      authorization_code.redirect_uri = code.redirectUri;
      authorization_code.scope = code.scope;
      await authorization_code.save();
    }
    else {
      const newToken = new OAuth2AuthorizationCode({
      user_id: user.user_id,
      client_id: client.id,
      authorization_code: code.authorizationCode,
      expires_at: code.expiresAt,
      redirect_uri: code.redirectUri,
      scope: code.scope
      });
      await newToken.save();
    } 
    return {
      user: user,
      client: client,
      authorizationCode: code.authorizationCode,
      expires_at: code.expiresAt,
      scope: code.scope
    };
  },

  getAccessToken: async function (accessToken: string) {
  // 获取访问token
    let token = await OAuth2Token.findOne({ access_token: accessToken });
    if (token) {
      const user = await User.findOne({ user_id: token.user_id });
      const client = await OAuth2Client.findOne({ client_id: token.client_id });
      return {
          user: user,
          client: { id: client.id },
          accessToken: token.access_token,
          accessTokenExpiresAt: token.access_token_expires_at,
          scope: token.scope,
      };
    }
    else {
      return null;
    }
  },

  generateAccessToken: function (client: any, user: any, scope: any) {
    const bf = Buffer.from(process.env.AUTH_ENCRYPTION_KEY_BASE64!, 'base64');
    return jwt.sign({ client_id: client.id, user_id: user.user_id, scope: scope }, bf, {
      algorithm: 'RS256',
      expiresIn: 60 * 60 * 24 * 30,
    });
  },

  getAuthorizationCode: async function (authorizationCode: string) {
  // 获取已生成的授权码
    let code = await OAuth2AuthorizationCode.findOne({ authorization_code: authorizationCode });
    if (code) {
      const user = await User.findOne({ user_id: code.user_id });
      const client = await OAuth2Client.findOne({ client_id: code.client_id });
      return {
        user: user,
        client: { id: client.client_id },
        authorization_code: code.authorization_code,
        expiresAt: code.expires_at,
        scope: code.scope
      };
    }
    else {
      return null;
    }
  },

  revokeAuthorizationCode: async function (code: any) {
  // 授权码使用后立即删除避免重复使用
    await OAuth2AuthorizationCode.deleteOne({ authorization_code: code.authorization_code });
    const codeWasFoundAndDeleted = true;
    return new Promise(resolve => resolve(codeWasFoundAndDeleted));
  },

  validateScope: function (user: any, client: any, scope: string) {
  //检查授权域
    if (!scope || !scope.split(' ').every(s => client?.scopes.includes(s))) {
      return false;
    }
    return scope;
  },

  verifyScope: function (accessToken: any, scope: string) {
    if (!accessToken.scope) {
      return false;
    }
    let requestedScopes = scope.split(' ');
    let authorizedScopes = accessToken.scope.split(' ');
    return requestedScopes.every(s => authorizedScopes.indexOf(s) >= 0);
  },

  getClient: async function(client_id: string, client_secret?: string) {
    let client = null;
    if (!client_secret) {
      client = await OAuth2Client.findOne({ client_id: client_id });
    }
    else {
      client = await OAuth2Client.findOne({ client_id: client_id, client_secret: client_secret });
    }
    if (client) {
      return {
        id: client.client_id,
        name: client.client_name,
        icon_url: client.icon_url,
        redirectUris: client.redirect_uris,
        grants: client.grants,
        scopes: client.scopes,
      };
    }
    else {
      return null;
    }
  }
};

export default oauth2Model;