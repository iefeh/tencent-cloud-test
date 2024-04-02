import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import { PipelineStage } from 'mongoose';
import { enrichUserQuests } from "@/lib/quests/questEnrichment";
import { getMaxLevelBadge } from "@/pages/api/badges/display";
import { getCurrentBattleSeason } from '@/lib/battlepass/battlepass';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const user_id = req.userId;
    const userId = String(user_id);
    const { page_num, page_size } = req.query;
    if (!page_num || !page_size) {
        res.json(response.invalidParams());
        return
    }
    //获得当前赛季
    const current_season = await getCurrentBattleSeason();
    const pageNum = Number(page_num);
    const pageSize = Number(page_size);

    const pagination = await paginationQuests(pageNum, pageSize);
    if (pagination.total == 0 || pagination.quests.length == 0) {
        // 当前没有匹配的数据
        res.json(response.success({
            total: pagination.total,
            page_num: pageNum,
            page_size: pageSize,
            quests: pagination.quests,
        }));
        return;
    }
    // 目前有足够的任务数，丰富响应的数据
    const quests = pagination.quests;
    await enrichUserQuests(userId!, quests);
    //在reward字段里面添加badges(可能有多个)的信息，返回
    await loadBadgeInfo(quests);
    enrichQuestNewTag(quests);
    res.json(response.success({
        total: pagination.total,
        page_num: pageNum,
        page_size: pageSize,
        quests: quests,
    }));
});

function enrichQuestNewTag(quests: any[]) {
    const now = Date.now();
    for (let q of quests) {
        q.is_new = false;
        // 检查任务的创建时间是否在最近7天内
        if (now - q.created_time < 7 * 24 * 3600 * 1000) {
            q.is_new = true;
        }
        // 移除任务的创建时间
        delete q.created_time;
    }
}

async function loadBadgeInfo(quests: any[]) {
    for (let c of quests) {
        if (c.reward.badge_ids?.length > 0) {
            c.reward.badges = [];
            for (let t of c.reward.badge_ids) {
                let i = await getMaxLevelBadge(t);
                c.reward.badges.push({ id: t, description: i.description, name: i.name, icon_url: i.icon_url, image_url: i.image_url, });
            }
        }
    }
}

async function paginationQuests(pageNum: number, pageSize: number): Promise<{ total: number, quests: any[] }> {
    const skip = (pageNum - 1) * pageSize;
    const now = Date.now();
    const aggregateQuery: PipelineStage[] = [
        {
            $match: {
                'active': true,
                'deleted_time': null,
                'start_time': { $lte: now },
                'end_time': { $gt: now },
            }
        },
        {
            $sort: {
                // 按照'order'升序排序
                'order': 1
            }
        },
        {
            $project: {
                '_id': 0,
                '__v': 0,
                'deleted_time': 0,
                'updated_time': 0,
                'active': 0,
                'order': 0,
                'reward.range_reward_ids': 0,
            }
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: pageSize }]
            }
        }
    ];
    const results = await Quest.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return { total: 0, quests: [] }
    }
    return { total: results[0].metadata[0].total, quests: results[0].data }
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