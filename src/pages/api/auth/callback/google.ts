import '../../../../lib/auth/google-auth';
import {NextApiResponse, NextApiRequest} from 'next'
import passport from 'passport'
import {AuthorizationPayload, AuthorizationFlow} from "@/lib/models/authentication";
import * as response from '../../../../lib/response/response';
import {redis} from "@/lib/redis/client";
import {v4 as uuidv4} from 'uuid';
import {appendQueryParamsToUrl} from "@/lib/utils/url";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {state, error} = req.query;
    if (!state) {
        console.log("callback state not found");
        res.json(response.notFound());
        return;
    }

    const stateVal = await redis.get(`authorization_state:google:${state}`);
    const authPayload = JSON.parse(stateVal) as AuthorizationPayload;

    if (error) {
        if (error.includes('access_denied')) {
            const landing_url = appendQueryParamsToUrl(authPayload.landing_url, response.authorizationDenied());
            res.redirect(landing_url);
            return;
        }
        console.error(error);
        const landing_url = appendQueryParamsToUrl(authPayload.landing_url, response.serverError());
        res.redirect(landing_url);
        return;
    }

    const authenticate = passport.authenticate('google', {
            scope: ['profile', 'email'], // 根据需要添加授权域
            session: false
        },
        // 在授权verify过后的回调，见 src/lib/passport/google-auth.ts
        async (err, user, info, status) => {
            if (!user && !info) {
                // 没有
                return;
            }
            if (info && info.code == response.ResponseCode.SUCCESS) {
                // 执行用户登录
                const user_id = info.data;
                // 生成登录token
                const token = uuidv4();
                await redis.setex(`user_session:${token}`, 60 * 60 * 15, user_id);
                info.token = token;
            }
            const landing_url = appendQueryParamsToUrl(authPayload.landing_url, info);
            console.log(landing_url);
            res.redirect(landing_url);
        });
    authenticate(req, res);
}