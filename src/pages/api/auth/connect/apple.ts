import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { generateAuthorizationURL } from '@/lib/authorization/provider/apple';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { queryUserAppleAuthorization } from '@/lib/quests/implementations/connectAppleQuest';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  // 检查用户是否已经绑定，不允许重复绑定
  const appleAuth = await queryUserAppleAuthorization(req.userId!);
  if (appleAuth) {
    res.json(response.accountAlreadyBoundMedia());
    return;
  }

  await generateAuthorizationURL(req, res);
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
