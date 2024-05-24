import type { NextApiResponse } from "next";
import { createRouter } from 'next-connect';

import { verifyTwitterTopic } from '@/lib/lottery/lottery';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();


const defaultErrorResponse = response.success({
    verified: false,
    message: "Network busy, please try again later.",
})

router.use(errorInterceptor(defaultErrorResponse), mustAuthInterceptor).post(async (req, res) => {
    const { lottery_pool_id } = req.body;
    if (!lottery_pool_id) {
      res.json(response.invalidParams());
      return;
    }
    const userId = String(req.userId);
    const lotteryPoolId = String(lottery_pool_id);
    const verifyResult = await verifyTwitterTopic(userId, lotteryPoolId);
    res.json(response.success(verifyResult));
    return;
});

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler();