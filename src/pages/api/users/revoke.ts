import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import {OAuthOptions} from "@/lib/authorization/types";
import {OAuthProvider} from "@/lib/authorization/oauth";
import logger from "@/lib/logger/winstonLogger";
import OAuthToken from "@/lib/models/OAuthToken";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.get(async (req, res) => {
    const authToken = await OAuthToken.findOne({platform_id: "1622609841528385536"});

    const oauthOps: OAuthOptions = {
        clientId: process.env.TWITTER_CLIENT_ID!,
        clientSecret: process.env.TWITTER_CLIENT_SECRET!,
        scope: 'offline.access tweet.read users.read follows.read like.read',
        redirectURI: "http://127.0.0.1:3000/api/auth/callback/twitter",
        authEndpoint: "https://twitter.com/i/oauth2/authorize",
        tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
        enableBasicAuth: true,
        onAccessTokenRefreshed: async newToken => {
            logger.debug("access token refreshed:", newToken)
        },
        onRefreshTokenExpired: async newToken => {
            logger.debug("access token revoked:", newToken)
        }
    }
    const provider = new OAuthProvider(oauthOps);
    // 获取绑定用户
    const data = await provider.createRequest(authToken).get('https://api.twitter.com/2/users/me?expansions=pinned_tweet_id&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified');
    console.log(data);
    res.json(response.success());
});

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});