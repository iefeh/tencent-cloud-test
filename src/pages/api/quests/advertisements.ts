import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import Advertisement from "@/lib/models/Advertisement";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.get(async (req, res) => {
    const now = Date.now();
    const ads = await Advertisement.find({
        active: true,
        start_time: {$lte: now},
        end_time: {$gte: now},
        deleted_time: null,
    }, {_id: 0, image_url: 1, link_url: 1, title: 1, description: 1}).sort({order: 1});
    res.json(response.success(ads));
});

// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
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