import * as response from '../../../../lib/response/response';
import {NextApiRequest, NextApiResponse} from 'next'
import {v4 as uuidv4} from 'uuid';
import {redis} from '@/lib/redis/client';
import {AuthorizationPayload} from "@/lib/models/authentication";
import {createRouter} from "next-connect";
import connectMongo from "@/lib/mongodb/client";
import User from "@/lib/models/User";
import {appendQueryParamsToUrl} from "@/lib/utils/url";
import UserTwitter from "@/lib/models/UserTwitter";
import {generateUserSession} from "@/lib/middleware/session";
import {twitterOAuthProvider} from "@/lib/authorization/provider";
import {genLoginJWT} from "@/lib/particle.network/auth";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
    const {state, error, code} = req.query;
    if (!state) {
        console.log("callback state not found");
        res.json(response.notFound());
        return;
    }
    const stateVal = await redis.get(`authorization_state:twitter:${state}`);
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

    const authToken = await twitterOAuthProvider.authenticate({
        code: code as string,
        code_verifier: authPayload.code_challenge,
    });
    // 获取绑定用户
    const data: any = await twitterOAuthProvider.createRequest(authToken).get('https://api.twitter.com/2/users/me?expansions=pinned_tweet_id&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified');
    const connection = data.data;
    // 执行用户登录
    await connectMongo();
    let userConnection = await UserTwitter.findOne({'twitter_id': connection.id, 'deleted_time': null})
    if (!userConnection) {
        // 新创建用户与其社交绑定
        const newUser = new User({
            user_id: uuidv4(),
            username: connection.name,
            avatar_url: connection.profile_image_url,
            created_time: Date.now(),
        });
        userConnection = new UserTwitter({
            user_id: newUser.user_id,
            twitter_id: connection.id,
            description: connection.description,
            verified: connection.verified,
            username: connection.username,
            name: connection.name,
            url: connection.url,
            protected: connection.protected,
            profile_image_url: connection.profile_image_url,
            location: connection.location,
            register_time: connection.register_time,
            public_metrics: connection.public_metrics,
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
        particle_jwt: genLoginJWT(userId),
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