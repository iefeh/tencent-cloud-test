import {OAuthOptions} from "@/lib/authorization/types";
import {OAuthProvider} from "@/lib/authorization/oauth";
import * as response from "@/lib/response/response";
import {AuthorizationFlow, AuthorizationPayload} from "@/lib/models/authentication";
import {v4 as uuidv4} from "uuid";
import {redis} from "@/lib/redis/client";
import {twitterOAuthProvider} from "@/lib/authorization/provider/twitter";


const discordOAuthOps: OAuthOptions = {
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    scope: process.env.DISCORD_AUTH_SCOPE!,
    redirectURI: process.env.DISCORD_REDIRECT_URL!,
    authEndpoint: process.env.DISCORD_AUTH_URL!,
    tokenEndpoint: process.env.DISCORD_TOKEN_URL!,
    enableBasicAuth: true
}
export const discordOAuthProvider = new OAuthProvider(discordOAuthOps);

export async function generateAuthorizationURL(req: any, res: any) {
    // 检查用户的授权落地页
    const landing_url = req.query.landing_url as string;
    if (!req.query.landing_url) {
        res.json(response.invalidParams());
        return;
    }

    // 生成授权的状态字段
    const currFlow = req.userId ? AuthorizationFlow.CONNECT : AuthorizationFlow.LOGIN;
    const payload: AuthorizationPayload = {
        landing_url: landing_url,
        flow: currFlow,
        code_challenge: uuidv4(),
        authorization_user_id: req.userId,
    };
    const state = uuidv4();
    await redis.setex(`authorization_state:discord:${state}`, 60 * 60 * 12, JSON.stringify(payload));

    // 生成授权地址.
    const authorizationUri = discordOAuthProvider.authorizationURL({
        state: state
    });
    res.json(response.success({
        authorization_url: authorizationUri
    }));
}