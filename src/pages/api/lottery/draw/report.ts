import type {NextApiResponse} from "next";
import { ethers } from 'ethers';
import { createRouter } from 'next-connect';

import { WALLECT_NETWORKS } from '@/constant/mint';
import { getLotteryPoolById } from '@/lib/lottery/lottery';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { ILotteryPool } from '@/lib/models/LotteryPool';
import UserLotteryDrawHistory from '@/lib/models/UserLotteryDrawHistory';
import { incrementUserNonce } from '@/lib/models/UserLotteryNonce';
import UserLotteryRequest, { IUserLotteryRequest } from '@/lib/models/UserLotteryRequest';
import doTransaction from '@/lib/mongodb/transaction';
import * as response from '@/lib/response/response';
import { draw } from '@/pages/api/lottery/draw';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
  const userId = req.userId!;
  const { tx_hash, lottery_pool_id } = req.body;
  // - 检查tx_hash的有效性；
  if (!tx_hash || !lottery_pool_id) {
    return res.json(response.invalidParams());
  }
  const lotteryPool = await getLotteryPoolById(lottery_pool_id) as ILotteryPool;
  const rpcUrl = WALLECT_NETWORKS[lotteryPool.chain_id].rpcUrls[0];
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const receipt = await provider.getTransactionReceipt(tx_hash);
  let abi = [ "event Draw(bytes32 indexed reqId, address indexed claimer, uint256 nonce, uint256 seed, uint256 result)" ];
  let iface = new ethers.Interface(abi);
  if (receipt) {
    const log = receipt.logs[0];
    let parsedLog = iface.parseLog({ topics: log.topics as string[], data: log.data});
    const { reqId, claimer, nonce, seed, result } = parsedLog!.args;
    const request = await UserLotteryRequest.findOne({ request_id: reqId });
    if (!request) {
      return res.json(response.invalidParams({ message: "Cannot find the lottery request."}));
    }
    if (request.tx_hash) {
      const history = await UserLotteryDrawHistory.findOne({ chain_request_id: reqId });
      return res.json(response.success(history));
    }
    // - 执行抽奖(可以考虑抽奖那边也基于请求id添加唯一索引，避免发生对相同请求进行二次抽奖的情况)
    let drawResult = await draw(userId, lottery_pool_id, request.draw_count, request.lottery_ticket_cost, request.mb_cost. reqId);
    if (drawResult.verified) {
      doTransaction(async (session) => {
        await incrementUserNonce(userId, session);
        await UserLotteryRequest.updateOne({ request_id: reqId }, { tx_hash: tx_hash }, { session });
      });
      return res.json(response.success(drawResult));
    }
    else {
      return res.json(response.serverError(drawResult));
    }
  } 
});

// this will run if none of the above matches
router.all((req, res) => {
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