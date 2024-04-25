import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import OAuth2Token from "@/lib/models/OAuth2Token";
import { errorInterceptor } from '@/lib/middleware/error';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
  // 取消已授权的app
  try {
    const token = await OAuth2Token.findOne({ client_id: req.body.client_id, user_id: req.userId });
    if (token) {
      token.access_token_expires_at = Date.now() - 1000;
      await token.save();
    }
    res.json(response.success());
  }
  catch (error: any) {
    res.json(response.serverError({ message: error.message }));
  }
  return;
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