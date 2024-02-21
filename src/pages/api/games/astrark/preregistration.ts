import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {redis} from "@/lib/redis/client";
import UserMetrics from "@/lib/models/UserMetrics";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
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
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/BattleBear.webp",
        probability: 0.122,
    },
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/EternalCaptain.webp",
        probability: 0.122,
    },
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/FlameApe.webp",
        probability: 0.008,
    },
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/General.webp",
        probability: 0.008,
    },
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/GodWhisperer.webp",
        probability: 0.122,
    },
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/GrandCannonUncle.webp",
        probability: 0.122,
    },
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/Livielt.webp",
        probability: 0.122,
    },
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/MechanicalTechnician.webp",
        probability: 0.122,
    },
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/SilentNinja.webp",
        probability: 0.122,
    },
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/SphericElectricity.webp",
        probability: 0.008,
    },
    {
        hero_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/share/Strangler.webp",
        probability: 0.122,
    },
]

async function generateAstrarkHeroURL(userId: string): Promise<string> {
    const userHeroURL = pickRandomHeroURL();
    // 保存用户的英雄地址
    await UserMetrics.updateOne(
        {user_id: userId, astrark_hero_url: null},
        {
            $set: {astrark_hero_url: userHeroURL},
            $setOnInsert: {created_time: Date.now()}
        },
        {upsert: true}
    );
    return userHeroURL;
}

function simulateDistribution(numPeople: number) {
    const distribution: Record<string, number> = {};

    for (let i = 0; i < numPeople; i++) {
        const pickedURL = pickRandomHeroURL();
        if (distribution[pickedURL]) {
            distribution[pickedURL]++;
        } else {
            distribution[pickedURL] = 1;
        }
    }

    // 转换为分布结果
    const distributionResult: Record<string, object> = {};
    for (const url in distribution) {
        distributionResult[url] = {
            userCount: distribution[url],
            percentage: (distribution[url] / numPeople) * 100  // 转换为百分比
        };
    }
    return distributionResult;
}

function pickRandomHeroURL(): string {
    let cumulativeProbabilities = 0;
    const thresholds = astrarkHeroURLs.map(card => (cumulativeProbabilities += card.probability));

    const random = Math.random() * cumulativeProbabilities;
    for (let i = 0; i < astrarkHeroURLs.length; i++) {
        if (random <= thresholds[i]) {
            return astrarkHeroURLs[i].hero_url;
        }
    }
    throw new Error(`pick astrark hero url failed`);
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