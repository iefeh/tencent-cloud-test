import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import {PipelineStage} from 'mongoose';
import Campaign, {CampaignStatus} from "@/lib/models/Campaign";
import CampaignAchievement from "@/lib/models/CampaignAchievement";
import {enrichUserQuests} from "@/lib/quests/enrichment";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
    const {campaign_id} = req.query;
    if (!campaign_id) {
        res.json(response.invalidParams());
        return
    }
    const userId = req.userId!;
    await getMongoConnection();
    // 查询活动
    const campaign = await Campaign.findOne({id: campaign_id, active: true, deleted_time: null}, {
        _id: 0,
        active: 0,
        created_time: 0,
        updated_time: 0,
        deleted_time: 0
    });
    if (!campaign) {
        res.json(response.notFound("Unknown campaign."));
        return;
    }
    // 丰富任务信息
    const tasks = campaign.tasks;
    if (tasks && tasks.length > 0) {
        await enrichUserQuests(userId, tasks);
    }
    res.json(response.success({
        campaign: campaign,
    }));
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