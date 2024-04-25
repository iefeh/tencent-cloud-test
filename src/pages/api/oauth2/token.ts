import {createRouter} from "next-connect";
import type {NextApiResponse} from "next";
import * as response from "@/lib/response/response";
import { Request, Response } from 'oauth2-server'
import {UserContextRequest} from "@/lib/middleware/auth";
import server from '../../../lib/oauth2/oauth2Server'
import {responseOnOauthError} from "@/lib/oauth2/response";

const router = createRouter<UserContextRequest, NextApiResponse>();
router.post(async (req, res) => {
  //根据授权码返回access token
  try {
    server.token(new Request(req), new Response(res))
    .then(
      function(token: any) {
        res.json(response.success({ access_token : token.accessToken, expires_at: token.accessTokenExpiresAt }));
      })
    .catch(
    function(error: any) {
      return responseOnOauthError(res, error);
    });
  }
  catch (error: any) {
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