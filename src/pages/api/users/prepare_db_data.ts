import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserMetricReward, {RewardItem, UserMetricRewardType} from "@/lib/models/UserMetricReward";
import {Metric} from "@/lib/models/UserMetrics";
import Quest, {IQuest} from "@/lib/models/Quest";
import {Schema} from "mongoose";
import {v4 as uuidv4} from "uuid";
import {QuestRewardType, QuestType} from "@/lib/quests/types";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.get(async (req, res) => {
    await getMongoConnection();
    // await saveQuests();
    // await saveWalletTokenReward();
    // await saveWalletNftReward();
    // await saveSteamReward();
    res.json(response.success());
});

async function saveQuests() {
    const now = Date.now();
    const quests = [
        {
            id: uuidv4(),
            name: "Verify Your Wallet",
            description: "Connect to your crypto wallet",
            tip: "Be sure to use the most valuable wallet to connect. MBs will be rewarded based on the value of crypto assets in your wallet.",
            type: QuestType.ConnectWallet,
            properties: null,
            reward: {
                type: QuestRewardType.Range,
                amount_formatted: "Variable",
                range_reward_ids: ["8610c3a9-6477-4bf0-9228-cf2bc0c9d965", "be3ed7bc-104b-4499-9b26-940608b11bb0"],
            },
            active: true,
            order: 3,
            created_time: now,
            updated_time: now,
        },
        {
            id: uuidv4(),
            name: "Verify Your Twitter",
            description: "Connect to your Twitter account.",
            tip: "",
            active: true,
            type: QuestType.ConnectTwitter,
            properties: null,
            reward: {
                type: QuestRewardType.Fixed,
                amount: 10,
                amount_formatted: "10",
                range_reward_ids: null,
            },
            order: 5,
            created_time: now,
            updated_time: now,
        },
        {
            id: uuidv4(),
            active: true,
            name: "Verify Your Discord",
            description: "Connect to your Discord account.",
            tip: "",
            type: QuestType.ConnectDiscord,
            properties: null,
            reward: {
                type: QuestRewardType.Fixed,
                amount: 10,
                amount_formatted: "10",
                range_reward_ids: null,
            },
            order: 6,
            created_time: now,
            updated_time: now,
        },
        {
            id: uuidv4(),
            active: true,
            name: "Join Discord Server",
            description: "Join Moonveil‘s official Discord server.",
            tip: "",
            type: QuestType.JoinDiscordServer,
            properties: {
                guild_url: "https://discord.gg/moonveil",
                guild_id: "1139446473642217502",
                url: "https://discord.gg/moonveil",
            },
            reward: {
                type: QuestRewardType.Fixed,
                amount: 10,
                amount_formatted: "10",
                range_reward_ids: null,
            },
            order: 7,
            created_time: now,
            updated_time: now,
        },
        {
            id: uuidv4(),
            active: true,
            name: "Twitter Follow @Moonveil_Studio",
            description: "Follow @Moonveil_Studio on Twitter.",
            tip: "",
            type: QuestType.FollowOnTwitter,
            properties: {
                username: "Moonveil_Studio",
                url: "https://twitter.com/intent/follow?screen_name=Moonveil_Studio",
            },
            reward: {
                type: QuestRewardType.Fixed,
                amount: 10,
                amount_formatted: "10",
                range_reward_ids: null,
            },
            order: 8,
            created_time: now,
            updated_time: now,
        },
        {
            id: uuidv4(),
            active: true,
            name: "Twitter Follow @AstrArk_World",
            description: "Follow @AstrArk_World on Twitter.",
            tip: "",
            type: QuestType.FollowOnTwitter,
            properties: {
                username: "AstrArk_World",
                url: "https://twitter.com/intent/follow?screen_name=AstrArk_World",
            },
            reward: {
                type: QuestRewardType.Fixed,
                amount: 10,
                amount_formatted: "10",
                range_reward_ids: null,
            },
            order: 9,
            created_time: now,
            updated_time: now,
        },
        {
            id: uuidv4(),
            active: true,
            name: "Twitter Repost Task",
            description: "Please repost a specified tweet to complete the task.",
            tip: "",
            type: QuestType.RetweetTweet,
            properties: {
                tweet_url: "https://twitter.com/AstrArk_World/status/1739647932520108394",
                tweet_id: "1739647932520108394",
                url: "https://twitter.com/intent/retweet?tweet_id=1739647932520108394",
            },
            reward: {
                type: QuestRewardType.Fixed,
                amount: 10,
                amount_formatted: "10",
                range_reward_ids: null,
            },
            order: 10,
            created_time: now,
            updated_time: now,
        },
        {
            id: uuidv4(),
            active: true,
            name: "Verify Your Steam",
            description: "Step 1: Sign in with your Steam. Step 2: Set your profile to \"Public\".",
            tip: "In order to view your profile, please go to Privacy Settings and set all profile items to \"Public\".",
            type: QuestType.ConnectSteam,
            properties: null,
            reward: {
                type: QuestRewardType.Range,
                amount_formatted: "0-810",
                range_reward_ids: ["bfd884ab-25ac-4095-94f6-61957dcb68a7"],
            },
            order: 4,
            created_time: now,
            updated_time: now,
        },
        {
            id: uuidv4(),
            active: true,
            name: "1st Membership Verifications",
            description: "If you are an early supporter who received the \"1st Membership\" role in our Discord community, please verify to receive your reward.",
            tip: "",
            type: QuestType.HoldDiscordRole,
            properties: {
                guild_url: "https://discord.gg/moonveil",
                guild_id: "1139446473642217502",
                role_ids: ["1164813166300114954"],
                url: "https://discord.gg/moonveil",
            },
            reward: {
                type: QuestRewardType.Fixed,
                amount: 100,
                amount_formatted: "100",
                range_reward_ids: null,
            },
            order: 2,
            created_time: now,
            updated_time: now,
        },
        {
            id: uuidv4(),
            active: false,
            name: "AstrArk Pre-register",
            description: "Click to pre-register the AstrArk game and claim your in-game rewards.",
            tip: "",
            type: QuestType.UserMetric,
            properties: {
                metric: Metric.PreRegisterAstrArk,
                value: true,
                operator: "==",
                url: "https://google.com",
            },
            reward: {
                type: QuestRewardType.Fixed,
                amount: 10,
                amount_formatted: "10",
            },
            order: 9,
            created_time: now,
            updated_time: now,
        },
        {
            id: uuidv4(),
            active: true,
            name: "DC Community Early Supporter",
            description: "If you're an early supporter of our DC community and have earned MBs, please kindly verify to claim your MBs.",
            tip: "",
            type: QuestType.Whitelist,
            properties: {
                whitelist_id: "discord_community_early_support",
            },
            reward: {
                type: QuestRewardType.Range,
                amount_formatted: "0-3000",
            },
            order: 1,
            created_time: now,
            updated_time: now,
        },
    ];
    await Quest.insertMany(quests);
}

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