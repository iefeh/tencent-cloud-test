import { NextApiRequest, NextApiResponse } from 'next';
import * as response from '@/lib/response/response';
import { redis } from '@/lib/redis/client';
import User from '../models/User';

// UserContextRequest 请求携带用户上下文信息
export interface UserContextRequest extends NextApiRequest {
  userId?: string;
}

export async function dynamicCors(req: UserContextRequest, res: NextApiResponse, next: () => void) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*'); // 允许任何来源
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 动态允许请求中的头部
  const requestedHeaders = req.headers;
  if (requestedHeaders) {
    for (const header in requestedHeaders) {
      res.setHeader(`Access-Control-Allow-Headers`, `${res.getHeader('Access-Control-Allow-Headers')}, ${header}`);
    }
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 直接对OPTIONS请求返回200
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
}

// mustAuthInterceptor 强制授权拦截器，如果用户未授权则直接返回
export async function mustAuthInterceptor(req: UserContextRequest, res: NextApiResponse, next: () => void) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    res.json(response.unauthorized());
    return;
  }
  const userId = await redis.get(`user_session:${authorization}`);
  if (!userId) {
    res.json(response.unauthorized());
    return;
  }

  // 将用户数据添加到请求对象中
  req.userId = userId;

  next();
}

// maybeAuthInterceptor 选择授权拦截器，如果用户有有效认证token则进行校验
export async function maybeAuthInterceptor(req: UserContextRequest, res: NextApiResponse, next: () => void) {
  const authorization = req.headers.authorization;
  if (authorization) {
    const userId = await redis.get(`user_session:${authorization}`);
    if (userId) {
      // 将用户数据添加到请求对象中
      req.userId = userId;
    }
  }
  next();
}
