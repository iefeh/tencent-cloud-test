import '../../../../lib/auth/twitter-auth';
import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import passport from 'passport'
import {v4 as uuidv4} from 'uuid';
import {redis} from '@/lib/redis/client';
import {AuthorizationPayload, AuthorizationFlow} from "@/lib/models/authentication";


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

    await redis.setex(`authorization_state:twitter:${state}`, 60 * 60 * 30, JSON.stringify(payload));

    // 返回授权地址
    const authenticate = passport.authenticate('twitter', {
            scope: ['offline.access', 'tweet.read', 'users.read', 'follows.read', 'like.read'],
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