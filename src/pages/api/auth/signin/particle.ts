import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import User from "@/lib/models/User";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {getEvmWallet, getParticleUser} from "@/lib/particle.network/auth";
import logger from "@/lib/logger/winstonLogger";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const userId = req.userId;
    const {particle_user_id, particle_auth_token, platform} = req.body;
    if (!particle_auth_token || !particle_user_id) {
        res.json(response.invalidParams());
        return
    }
    if (!platform) {
        res.json(response.invalidParams());
        return
    }
    await getMongoConnection();
    const data = await getParticleUser(particle_user_id, particle_auth_token);

    let particle: any;
    switch (platform) {
        case "web":
            particle = {
                "particle.user_id": data.uuid,
                "particle.web_token": particle_auth_token,
                "particle.evm_wallet": getEvmWallet(data.wallets),
            }
            break;
        case "android":
            particle = {
                "particle.user_id": data.uuid,
                "particle.android_token": particle_auth_token,
                "particle.evm_wallet": getEvmWallet(data.wallets),
            }
            break;
        case "ios":
            particle = {
                "particle.user_id": data.uuid,
                "particle.ios_token": particle_auth_token,
                "particle.evm_wallet": getEvmWallet(data.wallets),
            }
            break;
        default:
            res.json(response.invalidParams());
            return
    }
    logger.debug(`user ${userId} particle ${particle}`);
    const particleAuthUserId = data.jwtId.split(':')[1];
    if (particleAuthUserId != userId) {
        console.error(`want particle auth user ${userId} but got ${particleAuthUserId}`);
        res.json(response.invalidParams());
        return;
    }
    await User.updateOne({'user_id': userId}, {$set: particle});
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