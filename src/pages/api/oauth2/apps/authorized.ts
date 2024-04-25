import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {errorInterceptor} from '@/lib/middleware/error';
import OAuth2Client from "@/lib/models/OAuth2Client";
import OAuth2Token from "@/lib/models/OAuth2Token";

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
    const tokens = await OAuth2Token.find({user_id: req.userId, access_token_expires_at: {$gte: Date.now()}});
    let result: any[] = [];
    for (let token of tokens) {
        const client = await OAuth2Client.findOne({client_id: token.client_id});
        result.push({
            client_name: client.client_name,
            icon_url: client.icon_url,
            scope: token.scope
        });
    }
    res.json(response.success({result}))
});

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: 'Method not allowed',
    });
});

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});