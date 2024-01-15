import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {redis} from "@/lib/redis/client";
import UserMetrics from "@/lib/models/UserMetrics";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
    await getMongoConnection();
    // 查询当前预约人数
    const totalCount = await redis.get(`astrark_preregistration_count`);
    // 用户预约的情况.
    let preRegistered = false;
    let heroURL = "";
    if (req.userId) {
        const userMetric = await UserMetrics.findOne({user_id: req.userId!}, {
            _id: 0,
            pre_register_astrark: 1,
            astrark_hero_url: 1
        });
        preRegistered = userMetric?.pre_register_astrark || false;
        // 如果用户已有英雄地址
        if (userMetric && userMetric.astrark_hero_url) {
            heroURL = userMetric.astrark_hero_url;
        }
        // 用户已预约，但是没有英雄地址.
        if (preRegistered && userMetric.astrark_hero_url == undefined) {
            heroURL = await generateAstrarkHeroURL(req.userId!);
        }
    }
    res.json(response.success({
        total: totalCount,
        preregistered: preRegistered,
        hero_url: heroURL,
    }));
});

const astrarkHeroURLs = [
    "https://www.google.com?id=1",
    "https://www.google.com?id=2",
    "https://www.google.com?id=3",
    "https://www.google.com?id=4",
    "https://www.google.com?id=5",
]

async function generateAstrarkHeroURL(userId: string): Promise<string> {
    const randomIndex = Math.floor(Math.random() * astrarkHeroURLs.length);
    const userHeroURL = astrarkHeroURLs[randomIndex];
    // 保存用户的英雄地址
    await UserMetrics.updateOne({user_id: userId, astrark_hero_url: null}, {
        astrark_hero_url: userHeroURL,
    });
    return userHeroURL;
}

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