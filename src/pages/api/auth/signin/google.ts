import '../../../../lib/auth/google-auth';
import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import passport from 'passport'
import * as jwt from 'jsonwebtoken';
import {AuthorizationPayload, AuthorizationFlow} from "@/lib/models/authentication";
import {redis} from '@/lib/redis/client';
import {v4 as uuidv4} from 'uuid';
import {ClientCredentials, ResourceOwnerPassword, AuthorizationCode} from 'simple-oauth2';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 检查用户的授权落地页
    const landing_url = req.query.landing_url as string;
    if (!req.query.landing_url) {
        res.json(response.invalidParams());
        return;
    }
    // 生成授权的状态字段
    const payload: AuthorizationPayload = {
        landing_url: landing_url,
        flow: AuthorizationFlow.Login,
    };
    const state = uuidv4();
    await redis.setex(`authorization_state:google:${state}`, 60 * 60 * 30, JSON.stringify(payload));

    // const config = {
    //     client: {
    //         id: process.env.GOOGLE_CLIENT_ID!,
    //         secret: process.env.GOOGLE_CLIENT_SECRET!
    //     },
    //     auth: {
    //         tokenHost: 'https://www.googleapis.com/oauth2/v4/token',
    //         authorizeHost: 'https://accounts.google.com/o/oauth2/v2/auth',
    //         authorizePath: '/o/oauth2/v2/auth'
    //     }
    // };
    // const client = new AuthorizationCode(config);
    // const authorizationUri = client.authorizeURL({
    //     redirect_uri: "http://localhost:3000/api/auth/callback/google",
    //     scope: 'profile email',
    //     state: state,
    //     customParam: 'foo', // non-standard oauth params may be passed as well
    // });
    //
    // res.json(authorizationUri);
    // 返回授权地址
    const authenticate = passport.authenticate('google', {
            scope: ['profile', 'email'], // 根据需要添加授权域
            session: false,
            state: state,
        },
        // 在授权verify过后的回调，见 src/lib/passport/google-auth.ts
        (err, user, info, status) => {
            if (err) {
                console.log("error:", err);
            } else {
                console.log("user:", user);
                console.log("info:", info)
                console.log("status:", status)
                res.json({url: req.url});
            }
        });
    authenticate(req, res);
}