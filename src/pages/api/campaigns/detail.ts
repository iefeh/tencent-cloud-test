import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Campaign from "@/lib/models/Campaign";
import {enrichUserTasks} from "@/lib/quests/taskEnrichment";
import CampaignAchievement from "@/lib/models/CampaignAchievement";

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
    }).lean();
    if (!campaign) {
        res.json(response.notFound("Unknown campaign."));
        return;
    }
    // 丰富任务信息
    const tasks = campaign.tasks;
    if (tasks && tasks.length > 0) {
        await enrichUserTasks(userId, tasks);
    }
    await enrichCampaignClaim(userId, campaign);
    res.json(response.success({
        campaign: campaign,
    }));
});

async function enrichCampaignClaim(userId: string, campaign: any) {
    // 检查当前是否已经领取活动任务奖励
    const claim = await CampaignAchievement.findOne({user_id: userId, campaign_id: campaign.id}, {_id: 0});
    campaign.claimed = !!claim && !!claim.claimed_time;
    if (campaign.claimed) {
        return;
    }
    // 检查当前是否可以领取活动任务奖励
    campaign.claimable = false;
    let tasksCompleted = true;
    for (const task of campaign.tasks) {
        if (!task.verified) {
            tasksCompleted = false;
            break;
        }
    }
    if (tasksCompleted) {
        campaign.claimable = true;
    }
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