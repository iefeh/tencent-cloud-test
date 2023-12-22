import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {verifySignWallet} from "@/lib/web3/wallet";
import UserWallet from "@/lib/models/UserWallet";
import {genLoginJWT} from "@/lib/particle.network/auth";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const address = verifySignWallet(req, res);
    if (!address) {
        return;
    }
    // 检查当前用户是否已经绑定了钱包
    let userWallet = await UserWallet.findOne({user_id: req.userId, deleted_time: null});
    if (userWallet) {
        res.json(response.accountAlreadyBoundWallet());
        return;
    }
    // 检查钱包是否已被使用
    userWallet = await UserWallet.findOne({wallet_addr: address, deleted_time: null});
    if (userWallet) {
        res.json(response.walletAlreadyBoundToOthers());
        return;
    }
    // 绑定钱包
    userWallet = new UserWallet({
        user_id: req.userId,
        wallet_addr: address,
        created_time: Date.now(),
    });
    await userWallet.save();
    res.json(response.success());
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