import * as response from '../../../../lib/response/response';
import {NextApiRequest, NextApiResponse} from 'next'
import {createRouter} from "next-connect";
import {TwitterAuthFlow} from "@/lib/authorization/provider/twitter";
import {handleAuthCallback} from "@/lib/authorization/provider/authFlow";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
    await handleAuthCallback(new TwitterAuthFlow(), req, res);
});

// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});