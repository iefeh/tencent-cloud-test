import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Mint from "@/lib/models/Mint";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    const userId = req.userId;
    const {mint_id} = req.query;
    if (!mint_id) {
        return res.json(response.invalidParams());
    }
    const mint = await Mint.findOne({id: mint_id});
    if (!mint) {
        return res.json(response.notFound("Mint not qualified"));
    }

    return res.json(response.success(user));
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