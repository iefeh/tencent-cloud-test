import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import OAuth2Server from '@/lib/oauth2/server'
import { UserContextRequest, dynamicCors } from "@/lib/middleware/auth";
import UserWallet from '@/lib/models/UserWallet';
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import { responseOnOauthError } from "@/lib/oauth2/response";
import { Request, Response } from '@node-oauth/oauth2-server';
import User from "@/lib/models/User";
import { PipelineStage } from "mongoose";

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(dynamicCors).post(async (req, res) => {
    // 用于提供通过访问令牌获取用户信息的接口
    try {
        // 暂时取消授权
        // await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo })
        const wallets = req.body;

        if (!Array.isArray(wallets)) {
            res.json(response.invalidParams("Param should be a address array."));
            return;
        }

        if (wallets.length === 0) {
            res.json(response.success());
            return;
        }

        if (wallets.length > 50) {
            res.json(response.invalidParams("Wallet address array is too long."));
            return;
        }


        const result = await queryUserInfo(wallets);

        res.json(response.success(result));

    } catch (error: any) {
        return responseOnOauthError(res, error);
    }
});

async function queryUserInfo(wallets: any[]): Promise<any[]> {
    // 从user_wallet中查询出所有的user_id，和地址
    let user_wallets = await UserWallet.find({ deleted_time: null, wallet_addr: { $in: wallets } }, { user_id: 1, wallet_addr: 1 });
    let user_ids = user_wallets.map(u => u.user_id);
    let wallet_user_id_map: Map<string, string> = new Map<string, string>(user_wallets.map(u => [u.wallet_addr, u.user_id]));
    // let userInfos = await User.find({ $or: [{ user_id: { $in: userIds } }, { particle: { evm_wallet: { $in: wallets } } }] }, { user_id: 1, username: 1, particle: 1 }); console.log("userInfos", userInfos);
    // 查询出所有用户信息
    const pipeline: PipelineStage[] = [
        {
            $match: {
                $or: [{ user_id: { $in: user_ids } }, { "particle.evm_wallet": { $in: wallets } }]
            }
        }, {
            $project: {
                user_id: 1, username: 1, particle: 1
            }
        }
    ];
    let user_infos = await User.aggregate(pipeline);
    let particle_user_info_map: Map<string, any> = new Map<string, any>(user_infos.map(u => [u.particle.evm_wallet, u]))
    let user_info_map: Map<string, any> = new Map<string, any>(user_infos.map(u => [u.user_id, u])); console.log("userInfoMap", user_info_map);


    let result: any[] = [];
    for (let w of wallets) {
        if (wallet_user_id_map.has(w)) {
            let user_data: any = {};
            user_data.user_id = wallet_user_id_map.get(w);
            user_data.usernmae = user_info_map.get(user_data.user_id).username;
            user_data.address = w;
            result.push(user_data);
        }
        if (particle_user_info_map.has(w)) {
            result.push({ user_id: particle_user_info_map.get(w).user_id, username: particle_user_info_map.get(w).username, address: w });
        }
    }

    return result;
}
// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: 'Method not allowed',
    });
});

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});