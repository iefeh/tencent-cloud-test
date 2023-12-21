import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {createRouter} from "next-connect";
import {verifySignature} from "@/lib/web3/wallet";
import {redis} from "@/lib/redis/client";
import logger from "@/lib/logger/winstonLogger";
import UserWallet from "@/lib/models/UserWallet";
import {generateUserSession} from "@/lib/middleware/session";
import {genLoginJWT} from "@/lib/particle.network/auth";
import User from "@/lib/models/User";
import {v4 as uuidv4} from "uuid";
import getMongoConnection from "@/lib/mongodb/client";
import doTransaction from "@/lib/mongodb/transaction";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
    const {address, message, signature} = req.body;
    if (!address || !message || !signature) {
        res.json(response.invalidParams());
        return;
    }
    const validSig = verifySignature(address, message, signature);
    if (!validSig) {
        res.json(response.walletSignatureMismatch());
        return;
    }
    // 校验签名时间戳
    const messages = message.split(":");
    if (messages.length != 2) {
        logger.error(`want wallet ${address} sign message timestamp but not got`);
        res.json(response.walletSignatureMismatch());
        return;
    }
    const signature_time = Number(messages[1]);
    // 签名时间必须在5min内
    const timePassed = Date.now() - signature_time;
    if (timePassed > 5 * 50 * 1000) {
        logger.warn(`wallet ${address} signature expired`);
        res.json(response.walletSignatureExpired());
        return;
    }
    // 锁定签名5min，避免签名重放
    const ok = await redis.set(signature, 1, "EX", 60 * 5, "NX");
    if (!ok) {
        logger.error(`wallet ${address} signature reused`);
        res.json(response.walletSignatureExpired());
        return;
    }
    const conn = await getMongoConnection();
    // 检查用户是否历史用户
    let userWallet = await UserWallet.findOne({wallet_addr: address.toLowerCase(), deleted_time: null});
    if (!userWallet) {
        // 用户不存在，需要创建新的用户与钱包绑定
        userWallet = await createUserAndWallet(address);
    }
    const token = await generateUserSession(userWallet.user_id);
    res.json(response.success({
        token: token,
        particle_jwt: genLoginJWT(userWallet.user_id),
    }));
});

async function createUserAndWallet(address: string): Promise<UserWallet> {
    const user = new User({
        user_id: uuidv4(),
        username: address,
        avatar_url: process.env.DEFAULT_AVATAR_URL,
        created_time: Date.now(),
    });
    const userWallet = new UserWallet({
        user_id: user.user_id,
        wallet_addr: address.toLowerCase(),
        created_time: user.created_time,
    });
    await doTransaction(async (session) => {
        const opts = {session};
        await user.save(opts);
        await userWallet.save(opts);
    });
    return userWallet;
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