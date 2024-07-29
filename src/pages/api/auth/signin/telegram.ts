import * as response from '../../../../lib/response/response';
import { NextApiResponse, NextApiRequest } from 'next';
import { createRouter } from 'next-connect';
import { TelegramAuthFlow } from '@/lib/authorization/provider/telegram';
import { handleAuthCallback } from '@/lib/authorization/provider/authFlow';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  await handleAuthCallback(new TelegramAuthFlow(), req, res);
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
