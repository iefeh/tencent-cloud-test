import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Contract, {ContractCategory, IContract} from "@/lib/models/Contract";
import {redis} from "@/lib/redis/client";
import UserWallet, {IUserWallet} from "@/lib/models/UserWallet";
import {ethers} from 'ethers';
import UserTokenReward, {
    IUserTokenReward,
    UserTokenAuditStatus,
    UserTokenSourceType
} from "@/lib/models/UserTokenReward";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    const userId = req.userId;
    const {reward_ids} = req.query;
    if (!reward_ids || reward_ids.length == 0) {
        return res.json(response.invalidParams());
    }
    const ids = reward_ids.split(",");
    const rewards = await UserTokenReward.find({reward_id: {$in: ids}}) as IUserTokenReward[];
    if (!rewards || rewards.length != ids.length) {
        return res.json(response.notFound("Unknown reward."));
    }
    for (let reward of rewards) {
        if (reward.user_id != userId) {
            return res.json(response.notFound("Unknown reward."));
        }
        if (reward.status != UserTokenAuditStatus.Pending) {
            return res.json(response.invalidParams({message: "Reward already claimed."}));
        }
    }
    // 确保这些奖励必须是相同的链
    const chainId = rewards[0].chain_id;
    for (let reward of rewards) {
        if (reward.chain_id != chainId) {
            return res.json(response.invalidParams({message: "Rewards must be on the same chain."}));
        }
    }
    // 检查用户绑定的钱包
    const userWallet = await UserWallet.findOne({user_id: userId, deleted_time: null}) as IUserWallet;
    if (!userWallet) {
        return res.json(response.walletNotConnected());
    }
    // 获取领取合约
    const paymentContract = await Contract.findOne({
        chain_id: chainId,
        category: ContractCategory.GAME_PAYMENT
    }) as IContract;
    if (!paymentContract) {
        throw new Error("Game payment contract not found");
    }
    const permits = await constructRewardPermit(userWallet, rewards, paymentContract);
    return res.json(response.success({
        chain_id: paymentContract.chain_id,
        contract_address: paymentContract.address,
        permits: permits,
    }));
});

async function constructRewardPermit(userWallet: IUserWallet, rewards: IUserTokenReward[], paymentContract: IContract) {
    const domain = {
        name: "GamePayment",
        version: "1",
        chainId: Number(paymentContract.chain_id),
        verifyingContract: ethers.getAddress(paymentContract.address),
    };
    const types = {
        TokenPermit: [
            {name: "reqId", type: "bytes32"},
            {name: "claimer", type: "address"},
            {name: "token", type: "address"},
            {name: "tokenAmount", type: "uint256"},
            {name: "expiration", type: "uint128"},
        ],
    };
    let permits = [];
    for (let reward of rewards) {
        const permit: any = {
            reqId: reward.reward_id,
            claimer: ethers.getAddress(userWallet.wallet_addr),
            token: ethers.getAddress(reward.token_address),
            tokenAmount: reward.token_amount_raw,
            expiration: Math.floor(Date.now() / 1000) + 1800,
        };
        const signer = new ethers.Wallet(process.env.DEVELOPER_PRIVATE_KEY!, null);
        permit.signature = await signer.signTypedData(domain, types, permit);
        permits.push(permit);
    }
    return permits;
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