import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import OAuth2Server from '@/lib/oauth2/server';
import { appendQueryParamsToUrl } from '@/lib/common/url';
import { dynamicCors, mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { OAuthModel } from '@/lib/oauth2/model';
import User from '@/lib/models/User';
import { responseOnOauthError } from '@/lib/oauth2/response';
import { Request, Response } from '@node-oauth/oauth2-server';
import logger from '@/lib/logger/winstonLogger';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(dynamicCors).get(async (req, res) => {
  // 验证请求参数，确认用户已登录（或重定向到登录页面），向用户展示授权页面
  let landing_url = '';
  try {
    const { error, client } = await checkAuthParams(req);
    if (error) {
      landing_url = appendQueryParamsToUrl(process.env.FRONT_OAUTH_ROUTER!, {
        error: error,
      });
    } else {
      landing_url = appendQueryParamsToUrl(process.env.FRONT_OAUTH_ROUTER!, {
        ...req.query,
        client_name: client?.name,
        icon_url: client?.iconURL,
      });
    }
    res.redirect(landing_url);
  } catch (error: any) {
    landing_url = appendQueryParamsToUrl(process.env.FRONT_OAUTH_ROUTER!, {
      error: error.message,
    });
    res.redirect(landing_url);
  }
});

async function checkAuthParams(req: any): Promise<{ error: string; client?: any }> {
  const { client_id, redirect_uri, response_type, state, scope } = req.query;
  let error = '';
  if (!client_id) {
    return { error: 'Missing parameter: `client_id`' };
  }
  let client = await OAuthModel.getClient(client_id as string);
  if (!client) {
    return { error: 'Missing parameter: `invalid client_id`' };
  }
  if (!redirect_uri || client?.redirectUris.includes(redirect_uri as string) === false) {
    return { error: 'Invalid request: `redirect_uri` is not a valid URI' };
  }
  if (!response_type) {
    return { error: 'Missing parameter: `response_type`' };
  }
  if (!state) {
    return { error: 'Missing parameter: `state`' };
  }
  if (!scope || scope.length === 0) {
    return { error: 'Missing parameter: `scope`' };
  }
  if (
    !String(scope)
      .split(' ')
      .every((s) => client?.scopes.includes(s))
  ) {
    return { error: 'Invalid request: `scope` is not valid' };
  }
  return { error, client };
}

router.use(mustAuthInterceptor).post(async (req, res) => {
  // 对认证客户进行授权, 返回授权码
  try {
    const user = await User.findOne({ user_id: req.userId });
    // 判断用户是否已封禁
    if (user.is_banned) {
      return res.json(response.userBanned());
    }
    const code = await OAuth2Server.authorize(new Request(req), new Response(res), {
      authenticateHandler: {
        handle: () => {
          return user;
        },
      },
    });
    logger.debug(
      `user ${user?.user_id} authorized client ${code.client.client_id} to get code ${code.authorizationCode}`,
    );
    return res.json(
      response.success({
        authorization_code: code.authorizationCode,
        expires_at: code.expiresAt,
        state: req.body.state,
      }),
    );
  } catch (error: any) {
    return responseOnOauthError(res, error);
  }
});

// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
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

