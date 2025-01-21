import type {NextApiResponse} from "next";
import { ethers } from 'ethers';
import { createRouter } from 'next-connect';

import { WALLECT_NETWORKS } from '@/constant/mint';
import logger from '@/lib/logger/winstonLogger';
import { verifyLotteryQualification } from '@/lib/lottery/lottery';
import { UserContextRequest } from '@/lib/middleware/auth';
import UserLotteryDrawHistory from '@/lib/models/UserLotteryDrawHistory';
import { incrementUserNonce } from '@/lib/models/UserLotteryNonce';
import UserLotteryRequest from '@/lib/models/UserLotteryRequest';
import doTransaction from '@/lib/mongodb/transaction';
import * as response from '@/lib/response/response';
import { draw } from '@/pages/api/lottery/draw';
import { sleep } from '@/utils/common';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.post(async (req, res) => {
	const { tx_hash, chain_id } = req.body;
	// - 检查tx_hash的有效性；
	if (!tx_hash || !chain_id) {
		return res.json(response.invalidParams());
	}
  
	const rpcUrl = WALLECT_NETWORKS[chain_id].rpcUrls[0];
	const provider = new ethers.JsonRpcProvider(rpcUrl);
	let receipt: any = null;
	let retry = 0;
	while (retry < 10) {
		receipt = await provider.getTransactionReceipt(tx_hash);
	if (receipt) {
		break;
	}
		await sleep(1000);
		retry += 1;
	}
	if (!receipt) {
		logger.warn(`Trasaction is not recongnized chain id:${chain_id}, tx_hash:${tx_hash}.`);
		return res.json(response.transactionNotRecongnized());
	}
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
		const userId = request.user_id;
		const canDraw = await verifyLotteryQualification(request.lottery_pool_id, request.draw_count, request.lottery_ticket_cost, request.mb_cost, userId);
		if (!canDraw.verified) {
			return res.json(response.invalidParams(canDraw));
		}
		// - 执行抽奖(可以考虑抽奖那边也基于请求id添加唯一索引，避免发生对相同请求进行二次抽奖的情况)
		let drawResult = await draw(userId, request.lottery_pool_id, request.draw_count, request.lottery_ticket_cost, request.mb_cost, reqId);
		if (drawResult.verified) {
			doTransaction(async (session) => {
				await incrementUserNonce(userId, session);
				await UserLotteryRequest.updateOne({ request_id: reqId }, { tx_hash: tx_hash }, { session });
			});
			return res.json(response.success(drawResult));
		}
		else if (drawResult.duplicated) {
			const history = await UserLotteryDrawHistory.findOne({ chain_request_id: reqId });
			return res.json(response.success(history));
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