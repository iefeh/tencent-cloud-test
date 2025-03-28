import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Mint, {IMint} from "@/lib/models/Mint";
import Contract, {ContractCategory, IContract} from "@/lib/models/Contract";
import {redis} from "@/lib/redis/client";

import UserWallet, {IUserWallet} from "@/lib/models/UserWallet";
import {ethers} from 'ethers';
import MiniGameDetail, {IMiniGameDetail} from "@/lib/models/MiniGameDetail";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    const userId = req.userId;
    const {game_id, amount} = req.query;
    if (!game_id || !amount) {
        return res.json(response.invalidParams());
    }
    if (Number(amount) <= 0 || Number(amount) > 10) {
        return res.json(response.invalidParams());
    }
    // 查询游戏
    const miniGame = await MiniGameDetail.findOne({client_id: game_id}) as IMiniGameDetail;
    if (!miniGame) {
        return res.json(response.invalidParams("Unknown game"));
    }
    if (Date.now() > miniGame.ticket_expired_at!) {
        return res.json(response.invalidParams("Cannot mint expired ticket"));
    }
    // 检查用户绑定的钱包
    const userWallet = await UserWallet.findOne({user_id: userId, deleted_time: null}) as IUserWallet;
    if (!userWallet) {
        return res.json(response.walletNotConnected());
    }
    const paymentContract = await Contract.findOne({
        chain_id: miniGame.chain_id,
        category: ContractCategory.GAME_PAYMENT
    }) as IContract;
    if (!paymentContract) {
        throw new Error("Game payment contract not found");
    }
    const lockKey = `buy_ticket_permit_lock:${userId}`;
    const locked = await redis.set(lockKey, Date.now(), "EX", 15, "NX");
    if (!locked) {
        return res.json(response.tooManyRequests({
            message: "Verification is under a 15s waiting period, please try again later.",
        }));
    }
    const permit = await constructTicketPermit(userWallet, miniGame, paymentContract, amount as string);
    await redis.del(lockKey);
    return res.json(response.success({
        chain_id: paymentContract.chain_id,
        contract_address: paymentContract.address,
        permit: permit,
    }));
});

async function constructTicketPermit(userWallet: IUserWallet, miniGame: IMiniGameDetail, gamePaymentContract: IContract, amount: string) {
    const domain = {
        name: "GamePayment",
        version: "1",
        chainId: Number(gamePaymentContract.chain_id),
        verifyingContract: ethers.getAddress(gamePaymentContract.address),
    };
    const types = {
        TicketPermit: [
            {name: "player", type: "address"},
            {name: "token", type: "address"},
            {name: "tokenAmount", type: "uint256"},
            {name: "game", type: "bytes32"},
            {name: "tickets", type: "uint128"},
            {name: "expiration", type: "uint128"},
        ],
    };
    const totalCost = BigInt(miniGame.ticket_price_raw) * BigInt(amount as string);
    const ticketPermit: any = {
        player: ethers.getAddress(userWallet.wallet_addr),
        token: miniGame.token_address,
        tokenAmount: totalCost.toString(),
        game: miniGame.client_id_hash,
        tickets: amount,
        expiration: Math.floor(Date.now() / 1000) + 1800,
    };
    const signer = new ethers.Wallet(process.env.DEVELOPER_PRIVATE_KEY!, null);
    ticketPermit.signature = await signer.signTypedData(domain, types, ticketPermit);
    return ticketPermit;
}

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