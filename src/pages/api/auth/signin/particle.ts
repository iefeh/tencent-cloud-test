import type {NextApiRequest, NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectMongo from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import User from "@/lib/models/User";
import UserGoogle from "@/lib/models/UserGoogle";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserTwitter from "@/lib/models/UserTwitter";
import {getEvmWallet, getParticleUser} from "@/lib/particle.network/auth";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const userId = req.userId;
    const {particle_user_id, particle_auth_token, platform} = req.body;
    if (!particle_auth_token || !particle_user_id) {
        res.json(response.invalidParams());
        return
    }
    if (!platform || platform != 'web') {
        res.json(response.invalidParams());
        return
    }
    await connectMongo();
    const data = await getParticleUser(particle_user_id, particle_auth_token);
    const particle = {
        web_token: particle_auth_token,
        user_id: data.uuid,
        evm_wallet: getEvmWallet(data.wallets),
    }
    const particleAuthUserId = data.jwtId.split(':')[1];
    if (particleAuthUserId != userId) {
        console.error(`want particle auth user ${userId} but got ${particleAuthUserId}`);
        res.json(response.invalidParams());
        return;
    }
    await User.updateOne({'user_id': userId}, {'particle': particle});
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
        res.status(500).json(response.serverError());
    },
});