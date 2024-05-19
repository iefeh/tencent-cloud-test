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
        await OAuth2Server.authenticate(new Request(req), new Response(res), {scope: OAuth2Scopes.UserInfo})
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
    let userWallets = await UserWallet.find({ deleted_time: null, wallet_addr: { $in: wallets } }, { user_id: 1, wallet_addr: 1 });
    let userIds = userWallets.map(u => u.user_id);
    let walletUserIdMap: Map<string, string> = new Map<string, string>(userWallets.map(u => [u.wallet_addr, u.user_id]));
    // let userInfos = await User.find({ $or: [{ user_id: { $in: userIds } }, { particle: { evm_wallet: { $in: wallets } } }] }, { user_id: 1, username: 1, particle: 1 }); console.log("userInfos", userInfos);
    // 查询出所有用户信息
    const pipeline: PipelineStage[] = [
        {
            $match: {
                $or: [{ user_id: { $in: userIds } }, { "particle.evm_wallet": { $in: wallets } }]
            }
        }, {
            $project: {
                user_id: 1, username: 1, particle: 1
            }
        }
    ];
    let userInfos = await User.aggregate(pipeline);
    let particleUserInfoMap: Map<string, any> = new Map<string, any>(userInfos.map(u => [u.particle.evm_wallet, u]))
    let userInfoMap: Map<string, any> = new Map<string, any>(userInfos.map(u => [u.user_id, u])); console.log("userInfoMap", userInfoMap);
    

    let result: any[] = [];
    for (let w of wallets) {
        if (walletUserIdMap.has(w)) {
            result.push({ user_id: walletUserIdMap.get(w), username: userInfoMap.get(walletUserIdMap.get(w)!).username, address: w });
        }
        if (particleUserInfoMap.has(w)) {
            result.push({ user_id: particleUserInfoMap.get(w).user_id, username: particleUserInfoMap.get(w).username, address: w });
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