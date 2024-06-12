import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.post(async (req, res) => {
    // 打印用户请求体的内容
    console.log("post body:",req.body);
    res.json(response.success());
});

router.get(async (req, res) => {
    // 打印用户请求体的内容
    console.log("get body:",req.body);
    console.log("get query:",req.query);
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