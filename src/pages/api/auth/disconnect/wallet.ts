import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserWallet from "@/lib/models/UserWallet";
import doTransaction from "@/lib/mongodb/transaction";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    //
    await doTransaction(async function (session) {
        // 用户解绑钱包时，置空其资产信息
    })
    await UserWallet.updateOne({user_id: req.userId!,});
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