import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { queryUserAppleAuthorization } from '@/lib/quests/implementations/connectAppleQuest';
import { AppleAuthFlow } from '@/lib/authorization/provider/apple';
import { handleAuthCallback } from '@/lib/authorization/provider/authFlow';
import { AuthorizationFlow } from '@/lib/models/authentication';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  await handleAuthCallback(new AppleAuthFlow(), req, res);
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
