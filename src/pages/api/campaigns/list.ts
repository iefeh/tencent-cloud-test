import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {PipelineStage} from 'mongoose';
import Campaign, {CampaignStatus} from "@/lib/models/Campaign";
import CampaignAchievement from "@/lib/models/CampaignAchievement";
import { getMaxLevelBadge } from "@/pages/api/badges/display"
import { ca } from 'date-fns/locale';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
    const {page_num, page_size, campaign_status} = req.query;
    if (!page_num || !page_size) {
        res.json(response.invalidParams());
        return
    }
    const pageNum = Number(page_num);
    const pageSize = Number(page_size);
    const userId = req.userId;
    const pagination = await paginationCampaigns(pageNum, pageSize, campaign_status as CampaignStatus);
    if (pagination.total == 0 || pagination.data.length == 0) {
        // 当前没有匹配的数据
        res.json(response.success({
            total: pagination.total,
            page_num: pageNum,
            page_size: pageSize,
            campaigns: pagination.data,
        }));
        return;
    }
    // 检查用户是否已经领取对应的任务
    const campaigns = pagination.data;
    await enrichUserCampaigns(userId!, campaigns);
    await loadBadgeInfo(campaigns);
    res.json(response.success({
        total: pagination.total,
        page_num: pageNum,
        page_size: pageSize,
        campaigns: campaigns,
    }));
});

async function enrichUserCampaigns(userId: string, campaigns: any[]) {
    // 根据活动的当前时间区间决定其状态
    campaigns.forEach(c => {
        if (c.start_time > Date.now()) {
            c.status = CampaignStatus.Upcoming;
            return;
        }
        if (c.end_time < Date.now()) {
            c.status = CampaignStatus.Ended;
            return;
        }
        c.status = CampaignStatus.Ongoing;
    });
    // 初始化claimed字段，默认用户未领取活动奖励
    campaigns.forEach(c => c.claimed = false);
    if (!userId) {
        return;
    }
    // 查询用户已经完成的活动，修改达成标识与领取标识
    const campaignIds = campaigns.map(c => c.id);
    const achievements = await CampaignAchievement.find({user_id: userId, campaign_id: {$in: campaignIds}}, {_id: 0});
    const achievementMap = new Map<string, number>(achievements.map(a => [a.campaign_id, a.claimed_time]));
    campaigns.forEach(c => c.claimed = !!achievementMap.get(c.id));
}

async function paginationCampaigns(pageNum: number, pageSize: number, campaignStatus: CampaignStatus): Promise<{ total: number, data: any[] }> {
    const skip = (pageNum - 1) * pageSize;
    const matchStage: any = {
        'active': true,
        'deleted_time': null,
    };
    switch (campaignStatus) {
        case CampaignStatus.Upcoming:
            matchStage['start_time'] = {$gt: Date.now()};
            break;
        case CampaignStatus.Ongoing:
            matchStage['start_time'] = {$lte: Date.now()};
            matchStage['end_time'] = {$gt: Date.now()};
            break;
        case CampaignStatus.Ended:
            matchStage['end_time'] = {$lte: Date.now()};
            break;
    }
    const aggregateQuery: PipelineStage[] = [
        {
            $match: matchStage,
        },
        {
            $sort: {
                // 按照结束时间倒序排列
                'end_time': -1
            }
        },
        {
            $project: {
                '_id': 0,
                'id': 1,
                'name': 1,
                'image_url': 1,
                'start_time': 1,
                'end_time': 1,
                'rewards': 1,
            }
        },
        {
            $facet: {
                metadata: [{$count: "total"}],
                data: [{$skip: skip}, {$limit: pageSize}]
            }
        }
    ];
    const results = await Campaign.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return {total: 0, data: []}
    }
    return {total: results[0].metadata[0].total, data: results[0].data}
}

async function loadBadgeInfo( campaigns:any[] ) {
    for( let a of campaigns ) {
        for (let c of a.rewards) {
            if (c.type == "badge") {
                let targetBadge = await getMaxLevelBadge(c.badge_id);
                c.name = targetBadge.name;
                c.image_small = targetBadge.icon_url;
                c.image_medium = targetBadge.image_url;
            }
        }
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