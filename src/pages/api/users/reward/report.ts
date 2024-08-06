import type { NextApiResponse } from "next";
import { ethers } from 'ethers';
import { createRouter } from 'next-connect';

import logger from '@/lib/logger/winstonLogger';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import UserTokenReward, {
    IUserTokenReward, UserTokenAuditStatus
} from '@/lib/models/UserTokenReward';
import * as response from '@/lib/response/response';
import { WALLECT_NETWORKS } from '@/lib/web3/networks';
import { sleep } from '@/utils/common';
import * as Sentry from '@sentry/nextjs';

const router = createRouter<UserContextRequest, NextApiResponse>();


const defaultErrorResponse = response.success({
    verified: false,
    tip: "Network busy, please try again later.",
})

router.use(errorInterceptor(defaultErrorResponse), mustAuthInterceptor).post(async (req, res) => {
    const { tx_hash, chain_id } = req.body;
    if (!tx_hash || !chain_id) {
      return res.json(response.invalidParams());
    }
    try {
        const provider = new ethers.JsonRpcProvider(WALLECT_NETWORKS[chain_id].rpcUrls[0]);
        let receipt: any = null;
        let retry = 0;
        while (retry < 10) {
          receipt = await provider.getTransactionReceipt(tx_hash);
          if (receipt) {
            break;
          }
          retry += 1;
          await sleep(1000);
        }
        if (!receipt) {
          logger.warn(`Trasaction is not recongnized chain id:${chain_id}, tx_hash:${tx_hash}.`);
          return res.json(response.transactionNotRecongnized());
        }
        let abi = [ "event ClaimToken(bytes32 indexed reqId, address indexed claimer, address indexed token, uint256 tokenAmount)" ];
        let iface = new ethers.Interface(abi);
        let rewardIds: any[] = [];
        for (let log of receipt.logs) {
          let parsedLog = iface.parseLog({ topics: log.topics as string[], data: log.data});
          if (parsedLog) {
            const { reqId, claimer, token, tokenAmount } = parsedLog.args;
            const reward = await UserTokenReward.findOne({ reward_id: reqId, start_claim_time: null }) as IUserTokenReward;
            if (!reward) {
              return res.json(response.invalidParams());
            }
            rewardIds.push(reqId);
          }
        }
        await UserTokenReward.updateMany({ reward_id: { $in: rewardIds } }, { status: UserTokenAuditStatus.Claiming, start_claim_time: Date.now() });
        res.json(response.success());
    } catch (error) {
        logger.error(error);
        Sentry.captureException(error);
        res.status(500).json(defaultErrorResponse);
    }
});

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler();