import OAuth2Client from "@/lib/models/OAuth2Client";
import OAuth2Token from "@/lib/models/OAuth2Token";
import OAuth2AuthorizationCode from "@/lib/models/OAuth2AuthorizationCode";
import User from "@/lib/models/User";
import * as jwt from "jsonwebtoken";

// 支持的授权模型：https://node-oauthoauth2-server.readthedocs.io/en/master/model/overview.html
// 不同模型需要实现的方法不一样，目前已实现的授权模型有authorization_code grant、 implicit grant.
export const OAuthModel = {
    saveToken: saveAccessToken,
    saveAuthorizationCode: saveAuthorizationCode,
    getAccessToken: getAccessToken,
    generateAccessToken: generateAccessToken,
    getAuthorizationCode: getAuthorizationCode,
    revokeAuthorizationCode: revokeAuthorizationCode,
    validateScope: validateClientScope,
    verifyScope: verifyAccessTokenScope,
    getClient: getClientInfo,
};

// 保存访问token
// https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html#savetoken-token-client-user
async function saveAccessToken(token: any, client: any, user: any) {
    await OAuth2Token.updateOne(
        {user_id: user.user_id, client_id: client.id},
        {
            $set: {
                access_token: token.accessToken,
                access_token_expires_at: token.accessTokenExpiresAt,
                scope: token.scope,
            },
            $setOnInsert: {
                created_time: Date.now(),
            },
        },
        {upsert: true},
    );
    return {
        user: user,
        client: client,
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        scope: token.scope,
    };
}

// 保存授权码，只会在authorization_code模式时调用
// https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html#saveauthorizationcode-code-client-user
async function saveAuthorizationCode(code: any, client: any, user: any) {
    console.log("code:",code);
    console.log("client:",client);
    console.log("user:",user);
    await OAuth2AuthorizationCode.updateOne(
        {user_id: user.user_id, client_id: client.id},
        {
            $set: {
                authorization_code: code.authorizationCode,
                expires_at: code.expiresAt,
                redirect_uri: code.redirectUri,
                scope: code.scope,
                code_challenge: code.codeChallenge,
                code_challenge_method: code.codeChallengeMethod,
            },
            $setOnInsert: {
                created_time: Date.now(),
            },
        },
        {upsert: true},
    );
    return {
        user: user,
        client: client,
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        scope: code.scope,
        redirectUri: code.redirectUri,
    };
}

// 获取访问token
// https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html#getaccesstoken-accesstoken
async function getAccessToken(accessToken: string) {
    let token = await OAuth2Token.findOne({access_token: accessToken});
    if (!token) {
        return null;
    }
    const user = await User.findOne({user_id: token.user_id});
    const client = await OAuth2Client.findOne({client_id: token.client_id});
    return {
        user: user,
        client: {id: client?.client_id},
        accessToken: token.access_token,
        accessTokenExpiresAt: token.access_token_expires_at,
        scope: token.scope,
    };
}

// 生成单个访问token
// https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html#generateaccesstoken-client-user-scope
function generateAccessToken(client: any, user: any, scope: any) {
    const bf = Buffer.from(process.env.AUTH_ENCRYPTION_KEY_BASE64!, 'base64');
    return jwt.sign({client_id: client.id, user_id: user.user_id, scope: scope}, bf, {
        algorithm: 'RS256',
        expiresIn: 60 * 60 * 24 * 30,
    });
}

// 获取授权码
// https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html#getauthorizationcode-authorizationcode
async function getAuthorizationCode(authorizationCode: string) {
    let code = await OAuth2AuthorizationCode.findOne({authorization_code: authorizationCode});
    if (!code) {
        return null;
    }
    const user = await User.findOne({user_id: code.user_id});
    const client = await OAuth2Client.findOne({client_id: code.client_id});
    return {
        user: user,
        client: {id: client?.client_id},
        authorizationCode: code.authorization_code,
        expiresAt: code.expires_at,
        redirectUri: code.redirect_uri,
        scope: code.scope,
        codeChallenge: code.code_challenge,
        codeChallengeMethod: code.code_challenge_method,
    };
}

// 删除授权码，使用后立即删除避免重复使用
// https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html#revokeauthorizationcode-code
async function revokeAuthorizationCode(code: any) {
    await OAuth2AuthorizationCode.deleteOne({authorization_code: code.authorizationCode});
    return true;
}

// 校验当前域对特定客户的授权
// https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html#validatescope-user-client-scope
function validateClientScope(user: any, client: any, scope: string[]) {
    if (!scope || scope.length == 0) {
        return false;
    }
    console.log("validateClientScope:",client?.scopes, scope);
    if (!scope.every(s => client?.scopes.includes(s))) {
        console.log('scope not match');
        return false;
    }
    return scope;
}

// 校验访问token的scope
// https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html#verifyscope-accesstoken-scope
function verifyAccessTokenScope(accessToken: any, requestedScopes: string[]) {
    if (!accessToken.scope) {
        return false;
    }
    let authorizedScopes = accessToken.scope;
    return requestedScopes.every(s => authorizedScopes.includes(s));
}

// 获取客户端
// https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html#getclient-clientid-clientsecret
async function getClientInfo(clientId: string, clientSecret?: string) {
    let params: any = {client_id: clientId};
    if (clientSecret) {
        params['client_secret'] = clientSecret;
    }
    const client = await OAuth2Client.findOne(params);
    if (!client) {
        return null;
    }
    return {
        id: client.client_id,
        name: client.client_name,
        iconURL: client.icon_url,
        redirectUris: client.redirect_uris,
        grants: client.grants,
        scopes: client.scopes,
    };
}