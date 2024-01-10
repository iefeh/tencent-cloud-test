import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import {AuthorizationType} from "@/lib/authorization/types";
import {redis} from "@/lib/redis/client";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.get(async (req, res) => {
    // 撤销用户的cd
    await redis.del([
        `reconnect_cd:${AuthorizationType.Wallet}:0x58a7f8e93900a1a820b46c23df3c0d9783b24d05`,
        `reconnect_cd:${AuthorizationType.Twitter}:1622609841528385536`,
        `reconnect_cd:${AuthorizationType.Discord}:820332439892262912`,
        `reconnect_cd:${AuthorizationType.Steam}:76561199543367461`,
        `reconnect_cd:${AuthorizationType.Google}:101001953857805044141`,
    ]);
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