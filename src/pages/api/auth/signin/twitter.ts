import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {v4 as uuidv4} from 'uuid';
import {redis} from '@/lib/redis/client';
import {AuthorizationPayload, AuthorizationFlow} from "@/lib/models/authentication";
import {createRouter} from "next-connect";
import {twitterOAuthProvider} from "@/lib/authorization/provider";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
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
        code_challenge: uuidv4(),
    };
    const state = uuidv4();
    await redis.setex(`authorization_state:twitter:${state}`, 60 * 60 * 12, JSON.stringify(payload));

    const authorizationUri = twitterOAuthProvider.authorizationURL({
        state: state,
        code_challenge: payload.code_challenge!,
        code_challenge_method: 'plain'
    });
    res.json(response.success({
        authorization_url: authorizationUri
    }));
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