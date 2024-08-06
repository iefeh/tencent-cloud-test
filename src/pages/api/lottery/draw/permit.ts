import type {NextApiResponse} from "next";
import { ethers } from 'ethers';
import { createRouter } from 'next-connect';

import { getLotteryPoolById, verifyLotteryQualification } from '@/lib/lottery/lottery';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { findLotteryContract, IContract } from '@/lib/models/Contract';
import { ILotteryPool } from '@/lib/models/LotteryPool';
import { getUserNonce } from '@/lib/models/UserLotteryNonce';
import UserLotteryRequest, { IUserLotteryRequest } from '@/lib/models/UserLotteryRequest';
import UserWallet from '@/lib/models/UserWallet';
import { redis } from '@/lib/redis/client';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const userId = req.userId!;
    const {lottery_pool_id, draw_count, lottery_ticket_cost, mb_cost} = req.body;
    const validDrawCount = [1, 3, 5];
    if (!lottery_pool_id || !draw_count || !validDrawCount.includes(draw_count) || lottery_ticket_cost < 0 || mb_cost < 0) {
        res.json(response.invalidParams({verified: false, message: "Invalid params."}));
        return;
    }
    const lockKey = `lottery_request_lock:${lottery_pool_id}:${userId}`;
    const locked = await redis.set(lockKey, Date.now(), "EX", 15, "NX");
    if (!locked) {
        return res.json(response.tooManyRequests({
            message: "Verification is under a 15s waiting period, please try again later.",
        }));
    }
    try {
        return try2GetLotteryPermit(res, userId, lottery_pool_id, draw_count, lottery_ticket_cost, mb_cost);
    } finally {
        await redis.del(lockKey);
    }
});

async function try2GetLotteryPermit(res: any, userId: string, lottery_pool_id: string, draw_count: number, lottery_ticket_cost: number, mb_cost: number) {
    const result = await checkLotteryQualification(res, userId, lottery_pool_id, draw_count, lottery_ticket_cost, mb_cost);
    if (!result.passed) {
        return res.json(response.invalidParams({ message: result.message }));
    }
    // 检查用户绑定的钱包、合约
    const userWallet = await UserWallet.findOne({user_id: userId, deleted_time: null});
    if (!userWallet) {
        return res.json(response.walletNotConnected());
    }
    const pool = await getLotteryPoolById(lottery_pool_id) as ILotteryPool;
    const targetChain = pool.chain_id;
    if (!targetChain) {
        throw new Error(`lottery pool ${lottery_pool_id} chain id not found.`);
    }
    const lotteryCtrt = await findLotteryContract(pool.chain_id);
    if (!lotteryCtrt) {
        throw new Error(`lottery contract not found for chain ${targetChain}.`);
    }
    // 创建用户的抽奖请求
    const request = new UserLotteryRequest({
        user_id: userId,
        request_id: ethers.id(`${userWallet.wallet_addr}:${lottery_pool_id}:${Date.now()}`),
        lottery_pool_id: lottery_pool_id,
        draw_count: draw_count,
        lottery_ticket_cost: lottery_ticket_cost,
        mb_cost: mb_cost,
        created_time: Date.now(),
    });
    await request.save();
    const permit = await constructLotteryPermit(request, lotteryCtrt, userWallet.wallet_addr);
    return res.json(response.success({
        chain_id: lotteryCtrt.chain_id,
        contract_address: lotteryCtrt.address,
        permit: permit,
    }));
}


// TODO：检查是否具有抽奖资格
async function checkLotteryQualification(res: any, userId: string, lottery_pool_id: string, draw_count: number, lottery_ticket_cost: number, mb_cost: number): Promise<{
    passed: boolean,
    message: string
}> {
    const canDraw = await verifyLotteryQualification(lottery_pool_id, draw_count, lottery_ticket_cost, mb_cost, userId);
    if (canDraw.verified) {
        return {
            passed: true,
            message: ""
        }
    } else {
        return {
            passed: false,
            message: canDraw.message
        };
    }
}

async function constructLotteryPermit(request: IUserLotteryRequest, lotteryCtrt: IContract, claimer: string) {
    // 获取用户抽奖随机数
    const nonce = await getUserNonce(request.user_id);
    const domain = {
        name: "MoonveilLottery",
        version: "1",
        chainId: Number(lotteryCtrt.chain_id),
        verifyingContract: ethers.getAddress(lotteryCtrt.address),
    };
    // 构建并签名抽奖许可
    const types = {
        MintPermit: [
            {name: "reqId", type: "bytes32"},
            {name: "claimer", type: "address"},
            {name: "nonce", type: "uint256"},
            {name: "seed", type: "uint256"},
            {name: "expiredTime", type: "uint128"},
        ],
    };
    const expiredTime = Math.floor(Date.now() / 1000 + 10 * 60 * 60);
    const lotteryPermit: any = {
        reqId: request.request_id,
        claimer: claimer,
        nonce: nonce,
        seed: Date.now() + Math.floor(Math.random() * 1000000),
        expiredTime: expiredTime,
    };
    const signer = new ethers.Wallet(process.env.DEVELOPER_PRIVATE_KEY!, null);
    lotteryPermit.signature = await signer.signTypedData(domain, types, lotteryPermit);
    return lotteryPermit;
}


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