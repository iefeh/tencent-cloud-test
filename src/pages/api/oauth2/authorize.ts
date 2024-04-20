import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import { Request, Response } from 'oauth2-server'
import server from '../../../lib/oauth2/oauth2Server'
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import User from "@/lib/models/User";

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(mustAuthInterceptor).post(async (req, res) => {
    // 对认证客户进行授权, 返回授权码
    const user = await User.findOne({ user_id: req.userId });
    const {client_id, redirect_uri, response_type, grant_type, state} = req.query;
    server.authorize(
    new Request(req), 
    new Response(res),
    {
        authenticateHandler: {
            handle: () => { return user; }
        }
    })
    .then(function(code: any) {
        res.json(response.success({ authorization_code: code.authorizationCode, expires_at: code.expires_at, state: state }));
    })
    .catch(
        function(error: any) {
            res.json(response.unauthorized({ message: error.message }));
        });
    return;
});

router.get(async (req, res) => {
    // 验证请求参数，确认用户已登录（或重定向到登录页面），向用户展示授权页面, NOTE: 这里需要前端提供一下授权页面的url!!!!!!!!!
    const {client_id, redirect_uri, response_type, grant_type, state} = req.query;
    return res.redirect(`?client_id${client_id}&redirect_uri${redirect_uri}&response_type${response_type}&grant_type${grant_type}&state${state}`);
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