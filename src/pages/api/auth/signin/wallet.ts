import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {createRouter} from "next-connect";
import {verifySignature, verifySignWallet} from "@/lib/web3/wallet";
import {redis} from "@/lib/redis/client";
import logger from "@/lib/logger/winstonLogger";
import UserWallet, {IUserWallet} from "@/lib/models/UserWallet";
import {generateUserSession} from "@/lib/middleware/session";
import {genLoginJWT} from "@/lib/particle.network/auth";
import User from "@/lib/models/User";
import {v4 as uuidv4} from "uuid";
import getMongoConnection from "@/lib/mongodb/client";
import doTransaction from "@/lib/mongodb/transaction";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
    const address = verifySignWallet(req, res);
    if (!address) {
        return;
    }

    await getMongoConnection();
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

async function createUserAndWallet(address: string): Promise<IUserWallet> {
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