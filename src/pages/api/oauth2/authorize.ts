import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import { Request, Response } from 'oauth2-server'
import server from '../../../lib/oauth2/oauth2Server'
import { appendQueryParamsToUrl } from "@/lib/common/url";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import oauth2Model from "@/lib/oauth2/oauth2Model";
import User from "@/lib/models/User";
import {responseOnOauthError} from "@/lib/oauth2/response";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.get(async (req, res) => {
  // 验证请求参数，确认用户已登录（或重定向到登录页面），向用户展示授权页面
  let landing_url = "";
  try {
    const { client_id, redirect_uri, response_type, state, scope } = req.query;
    let error = "";
    let landing_url = "";
    if (!client_id) {
      error = 'Missing parameter: `client_id`';
    }
    let client = await oauth2Model.getClient(client_id as string);
    if (!client) {
      error = 'Missing parameter: `invalid client_id`';
    }
    if (!redirect_uri || client?.redirectUris.includes(redirect_uri as string) === false){
      error = 'Invalid request: `redirect_uri` is not a valid URI';
    }
    if (!response_type) {
      error = 'Missing parameter: `response_type`';
    }
    if (!state) {
      error = 'Missing parameter: `state`';
    }
    if (!scope || scope.length === 0) {
      error = 'Missing parameter: `scope`';
    }
    if (!String(scope).split(' ').every(s => client?.scopes.includes(s))) {
      error = 'Invalid request: `scope` is not valid';
    }
    if (error) {
      landing_url = appendQueryParamsToUrl('/oauth', {
        error: error
      });
    }
    else {
      landing_url = appendQueryParamsToUrl('/oauth', {
        client_id: client_id,
        client_name: client?.name,
        icon_url: client?.icon_url,
        redirect_uri: redirect_uri,
        response_type: response_type,
        state: state,
        scope: scope
      });
    }
    res.redirect(landing_url);
  }
  catch (error: any) {
    landing_url = appendQueryParamsToUrl('/oauth', {
      error: error.message
    });
    res.redirect(landing_url);
  }
  return;
});

router.use(mustAuthInterceptor).post(async (req, res) => {
    // 对认证客户进行授权, 返回授权码
  const user = await User.findOne({ user_id: req.userId });
  try {
    server.authorize(
      new Request(req), 
      new Response(res),
      {
        authenticateHandler: {
            handle: () => { return user; }
        }
      })
      .then(function(code: any) {
        res.json(response.success({ authorization_code: code.authorizationCode, expires_at: code.expires_at, state: req.body.state }));
      })
      .catch(function(error: any) {
        return responseOnOauthError(res, error);
      });
  }
  catch (error: any) {
    return responseOnOauthError(res, error);
  }
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