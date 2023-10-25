import '../../../../lib/auth/twitter-auth';
import * as response from '../../../../lib/response/response';
import {NextApiRequest, NextApiResponse} from 'next'
import passport from 'passport'
import * as jwt from 'jsonwebtoken';
import {v4 as uuidv4} from 'uuid';
import {redis} from '@/lib/redis/client';
import {AuthorizationPayload, AuthorizationFlow} from "@/lib/models/authentication";
import {createRouter} from "next-connect";
import connectMongo from "@/lib/mongodb/client";
import User from "@/lib/models/User";
import UserGoogle from "@/lib/models/UserGoogle";
import {appendQueryParamsToUrl} from "@/lib/utils/url";
import {ClientCredentials, ResourceOwnerPassword, AuthorizationCode} from 'simple-oauth2';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
    const {state, error} = req.query;
    if (!state) {
        console.log("callback state not found");
        res.json(response.notFound());
        return;
    }

    const stateVal = await redis.get(`authorization_state:twitter:${state}`);
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

    const config = {
        client: {
            id: process.env.TWITTER_CLIENT_ID!,
            secret: process.env.TWITTER_CLIENT_SECRET!
        },
        auth: {
            tokenHost: 'https://www.googleapis.com/oauth2/v4/token',
            authorizeHost: 'https://accounts.google.com/o/oauth2/v2/auth',
            authorizePath: '/o/oauth2/v2/auth'
        }
    };
    const client = new AuthorizationCode(config);
    const authorizationUri = client.authorizeURL({
        redirect_uri: "http://127.0.0.1:3000/api/auth/callback/twitter",
        scope: 'offline.access tweet.read users.read follows.read like.read',
        state: state,
        customParam: 'foo', // non-standard oauth params may be passed as well
    });

    res.json(authorizationUri);
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
        res.status(400).json({
            error: (err as Error).message,
        });
    },
});

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//     console.log("callback query:", req.query);
//     const state = req.query.state as string;
//     if (!req.query.state) {
//         console.log("callback state not found");
//         return;
//     }
//
//     // redis.get(`authorization_state:twitter:${state}`).then();
//     // const authPayload = JSON.parse(stateVal) as AuthorizationPayload;
//     // console.log("AuthorizationPayload:", authPayload);
//
//     // 返回授权地址
//     const authenticate = passport.authenticate('twitter', {
//             scope: ['offline.access', 'tweet.read', 'users.read', 'follows.read', 'like.read'],
//             session: false,
//         },
//         // 在授权verify过后的回调，见 src/lib/passport/google-auth.ts
//         (err, user, info, status) => {
//             if (err) {
//                 console.log("error:", err);
//             } else {
//                 console.log("user:", user);
//                 console.log("info:", info)
//                 console.log("status:", status)
//                 res.json({url: req.url});
//             }
//         });
//     authenticate(req, res);
// }