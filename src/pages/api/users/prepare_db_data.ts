import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserMetricReward, {RewardItem, UserMetricRewardType} from "@/lib/models/UserMetricReward";
import {Metric} from "@/lib/models/UserMetrics";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.get(async (req, res) => {
    await getMongoConnection();
    await saveWalletTokenReward();
    await saveWalletNftReward();
    await saveSteamReward();
    res.json(response.success());
});

async function saveSteamReward() {
    // 创建steam连接的奖励规则，每个阶段额外给10的基础奖励加成
    const steamRewardSettings: RewardItem[] = [
        {
            // 大于80综合评分奖励800MB
            require_metric_value: 80,
            reward_moon_beam: 800 + 10,
        },
        {
            // 大于50综合评分奖励500MB
            require_metric_value: 50,
            reward_moon_beam: 500 + 10,
        },
        {
            // 大于30综合评分奖励200MB
            require_metric_value: 30,
            reward_moon_beam: 200 + 10,
        },
        {
            // 大于10综合评分奖励100MB
            require_metric_value: 10,
            reward_moon_beam: 100 + 10,
        },
        {
            // 大于5综合评分奖励50MB
            require_metric_value: 5,
            reward_moon_beam: 50 + 10,
        },
        {
            // 大于0综合评分奖励0MB
            require_metric_value: 0,
            reward_moon_beam: 10,
        }
    ];
    const steamReward = new UserMetricReward({
        id: "bfd884ab-25ac-4095-94f6-61957dcb68a7",
        reward_type: UserMetricRewardType.MoonBeams,
        require_metric: Metric.SteamAccountRating,
        require_operator: ">",
        settings: steamRewardSettings,
        created_time: Date.now(),
    });
    await steamReward.save();
}

async function saveWalletTokenReward() {
    // 创建连接钱包的奖励规则
    const walletRewardSettings: RewardItem[] = [
        {
            // 大于100W奖励2500MB
            require_metric_value: 1000000,
            reward_moon_beam: 2500,
        },
        {
            // 大于50W奖励2000MB
            require_metric_value: 500000,
            reward_moon_beam: 2000,
        },
        {
            // 大于20W奖励1500MB
            require_metric_value: 200000,
            reward_moon_beam: 1500,
        },
        {
            // 大于10W奖励800MB
            require_metric_value: 100000,
            reward_moon_beam: 800,
        },
        {
            // 大于5W奖励500MB
            require_metric_value: 50000,
            reward_moon_beam: 500,
        },
        {
            // 大于1W奖励300MB
            require_metric_value: 10000,
            reward_moon_beam: 300,
        },
        {
            // 大于3000奖励100MB
            require_metric_value: 3000,
            reward_moon_beam: 100,
        },
        {
            // 大于1000奖励50MB
            require_metric_value: 1000,
            reward_moon_beam: 50,
        },
        {
            // 大于600奖励30MB
            require_metric_value: 600,
            reward_moon_beam: 30,
        },
        {
            // 大于300奖励20MB
            require_metric_value: 300,
            reward_moon_beam: 20,
        },
        {
            // 大于10奖励5MB
            require_metric_value: 10,
            reward_moon_beam: 5,
        },
    ];
    const walletReward = new UserMetricReward({
        id: "8610c3a9-6477-4bf0-9228-cf2bc0c9d965",
        reward_type: UserMetricRewardType.MoonBeams,
        require_metric: Metric.WalletTokenUsdValue,
        require_operator: ">",
        settings: walletRewardSettings,
        created_time: Date.now(),
    });
    await walletReward.save();
}

async function saveWalletNftReward() {
    // 创建连接钱包的奖励规则
    const walletRewardSettings: RewardItem[] = [
        {
            // 大于100W奖励5000MB
            require_metric_value: 1000000,
            reward_moon_beam: 5000,
        },
        {
            // 大于50W奖励2500MB
            require_metric_value: 500000,
            reward_moon_beam: 2500,
        },
        {
            // 大于10W奖励800MB
            require_metric_value: 100000,
            reward_moon_beam: 800,
        },
        {
            // 大于1W奖励300MB
            require_metric_value: 10000,
            reward_moon_beam: 300,
        },
        {
            // 大于1000奖励100MB
            require_metric_value: 1000,
            reward_moon_beam: 100,
        },
        {
            // 大于100奖励5MB
            require_metric_value: 100,
            reward_moon_beam: 30,
        },
    ];
    const walletReward = new UserMetricReward({
        id: "be3ed7bc-104b-4499-9b26-940608b11bb0",
        reward_type: UserMetricRewardType.MoonBeams,
        require_metric: Metric.WalletNftUsdValue,
        require_operator: ">",
        settings: walletRewardSettings,
        created_time: Date.now(),
    });
    await walletReward.save();
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