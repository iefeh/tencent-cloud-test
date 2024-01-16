import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import getRawBody from 'raw-body';


const router = createRouter<UserContextRequest, NextApiResponse>();

router.post(async (req, res) => {
    // 获取原始请求体作为Buffer
    const buf = await getRawBody(req);
    // console.log("Received request:", {
    //     url: req.url,
    //     method: req.method,
    //     headers: req.headers,
    //     body: buf.toString()
    // });
    res.json(buf.toString());
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

export const config = {
    api: {
        bodyParser: false,
    },
};