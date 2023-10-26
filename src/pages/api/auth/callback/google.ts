import * as response from '../../../../lib/response/response';
import {NextApiRequest, NextApiResponse} from 'next'
import {v4 as uuidv4} from 'uuid';
import {redis} from '@/lib/redis/client';
import {AuthorizationPayload} from "@/lib/models/authentication";
import {createRouter} from "next-connect";
import connectMongo from "@/lib/mongodb/client";
import User from "@/lib/models/User";
import {appendQueryParamsToUrl} from "@/lib/utils/url";
import UserGoogle, {IUserGoogle} from "@/lib/models/UserGoogle";
import {generateUserSession} from "@/lib/middleware/session";
import {googleOAuthProvider} from "@/lib/authorization/provider";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
    const {state, error, code} = req.query;
    if (!state) {
        console.log("callback state not found");
        res.json(response.notFound());
        return;
    }
    const stateVal = await redis.get(`authorization_state:google:${state}`);
    if (!stateVal) {
        res.json(response.notFound());
        return;
    }

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

    const authToken = await googleOAuthProvider.authenticate({
        code: code as string,
    });
    // 获取绑定用户
    const connection:any = await googleOAuthProvider.createRequest(authToken).get('https://openidconnect.googleapis.com/v1/userinfo');

    // 执行用户登录
    await connectMongo();
    let userConnection = await UserGoogle.findOne({'google_id': connection.sub, 'deleted_time': null})
    if (!userConnection) {
        // 新创建用户与其社交绑定
        const newUser = new User({
            user_id: uuidv4(),
            username: connection.name,
            avatar_url: connection.picture,
            created_time: Date.now(),
        });
        userConnection = new UserGoogle({
            user_id: newUser.user_id,
            google_id: connection.sub,
            email: connection.email,
            email_verified: connection.email_verified,
            given_name: connection.given_name,
            family_name: connection.family_name,
            name: connection.name,
            locale: connection.locale,
            picture: connection.picture,
            profile: connection.profile,
            created_time: Date.now(),
        });
        await userConnection.save();
        await newUser.save();
    }
    // 执行用户登录
    const userId = userConnection.user_id;
    const token = await generateUserSession(userId);
    const responseData = response.success();
    const landing_url = appendQueryParamsToUrl(authPayload.landing_url, {
        code: responseData.code,
        msg: responseData.msg,
        token: token,
    });
    res.redirect(landing_url);
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