import {createRouter} from "next-connect";
import type {NextApiResponse} from "next";
import * as response from "@/lib/response/response";
import {UserContextRequest, dynamicCors} from "@/lib/middleware/auth";
import OAuth2Server from '@/lib/oauth2/server'
import {responseOnOauthError} from "@/lib/oauth2/response";
import { Request, Response } from '@node-oauth/oauth2-server';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(dynamicCors).post(async (req, res) => {
    //根据授权码返回access token
    try {
        // 如当前用户使用了PKCE，则允许不传client_secret
        let requireClientSecret = true;
        if (req.body.code_verifier) {
            requireClientSecret = false;
        }
        console.log("request body:",req.body);
        const token = await OAuth2Server.token(new Request(req), new Response(res), {
            accessTokenLifetime: 60 * 60 * 24 * 30,
            requireClientAuthentication: requireClientSecret,
        })
        return res.json(response.success({
            access_token: token.accessToken,
            expires_at: token.accessTokenExpiresAt,
        }));
    } catch (error: any) {
        return responseOnOauthError(res, error);
    }
})

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