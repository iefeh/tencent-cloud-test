import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import { PipelineStage } from 'mongoose';
import { enrichUserQuests } from "@/lib/quests/questEnrichment";
import { getMaxLevelBadge } from "@/pages/api/badges/display";
import { getCurrentBattleSeason, getUserBattlePass } from "@/lib/battlepass/battlepass";
import { errorInterceptor } from '@/lib/middleware/error';
import { format } from "date-fns";


const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
    const { page_num, page_size, category } = req.query;
    let { tag } = req.query;
    if (!category || !page_num || !page_size) {
        res.json(response.invalidParams());
        return
    }
    let t: string | undefined;
    if (tag) {
        t = String(tag);
    }

    const pageNum = Number(page_num);
    const pageSize = Number(page_size);
    const userId = req.userId!;
    //判断用户是否拥有赛季通行证
    await getUserBattlePass(userId!);
    // const battlepass = await getUserBattlePass(userId!);
    // if (!battlepass) {
    //     res.json(response.invalidParams({
    //         msg: "user do not have battle pass."
    //     }));
    //     return;
    // }
    //查询查询符合要求的活动
    const pagination = await paginationQuests(pageNum, pageSize, String(category), t, userId);
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
        tags: pagination.tags,
        current_tag: tag ? tag : undefined,
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
        // 检查任务的创建时间是否在最近2天内 
        if (now - q.created_time < 2 * 24 * 3600 * 1000) {
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

export async function paginationQuests(pageNum: number, pageSize: number, category: string, tag: string | undefined, userId: string): Promise<{ tags: any[], total: number, quests: any[] }> {
    const skip = (pageNum - 1) * pageSize;
    let currentSeason = await getCurrentBattleSeason();
    if (!currentSeason) {
        currentSeason = { start_time: 0, end_time: Number.MAX_VALUE }
      }
    let aggregateQuery: PipelineStage[] = [];
    const now = Date.now();
    let matchOptions: any = {
        $match: {
            'active': true,
            'deleted_time': null,
            'start_time': { $lte: now },
            'end_time': { $gt: now },
            'category': category,
            //开始时间需要和当前赛季有一定关联，即开始时间在赛季期间,结束时间在赛季期间或开始时间结束时间横跨整个赛季。
            '$and': [{ '$or': [{ 'start_time': { $gte: currentSeason.start_time, $lte: currentSeason.end_time } }, { 'end_time': { $gte: currentSeason.start_time, $lte: currentSeason.end_time } }, { 'start_time': { $lte: currentSeason.start_time }, 'end_time': { $gte: currentSeason.end_time } }] }],
            '$or': [{ "visible_user_ids": { "$exists": false } }, { "visible_user_ids": userId }]
        }
    };

    const tags = await loadTags(matchOptions);
    //有标签，则添加标签进行查询
    if (tag) {
        matchOptions.$match.tag = tag;
    }

    aggregateQuery.push(matchOptions,
        {
            $sort: {
                // 按照'order'升序排序
                'order': 1
            }
        }, {
        $lookup: {
            from: 'quest_achievements',
            let: { quest_id: '$id' },
            pipeline: [
                {
                    // $match: { $expr: { $and: [{ $eq: ['$user_id', userId] }, { $eq: ['$quest_id', '$$quest_id'] }] } },
                    $match: { $expr: { $and: [{ $eq: ['$user_id', userId] }, { $or: [{ $eq: ['$quest_id', '$$quest_id'] }, { $eq: ['$quest_id', { $concat: [{ $toString: "$$quest_id" }, `,${format(Date.now(), 'yyyy-MM-dd')}`] }] }, , { $eq: ['$quest_id', { $concat: [{ $toString: "$$quest_id" }, `,${format(Date.now(), 'yyyy-ww')}`] }] }, { $eq: ['$quest_id', { $concat: [{ $toString: "$$quest_id" }, `,${format(Date.now(), 'yyyy-MM')}`] }] }] }] } },
                },
                {
                    $project: {
                        _id: 0,
                        user_id: 1,
                        quest_id: 1
                    }
                }
            ],
            as: 'achievements',
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
                'reward.season_pass_progress': 0,
                'visible_user_ids': 0
            }
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: pageSize }]
            }
        });

    const results = await Quest.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return { tags: tags, total: 0, quests: [] }
    }
    return { tags: tags, total: results[0].metadata[0].total, quests: results[0].data }
}

async function loadTags(matchOptions: any): Promise<any> {
    let aggregateQuery: PipelineStage[] = [];
    aggregateQuery.push(matchOptions, {
        $group: {
            _id: '$tag'
        }
    }, {//使用vlookup获得该种类下面的所有任务
        $lookup: {
            from: 'quest_classifications',
            let: { id: '$_id' },
            pipeline: [
                {
                    $match: { $expr: { $and: [{ $eq: ['$id', '$$id'] }] } },
                },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        order: 1
                    }
                }
            ],
            as: 'tag_info',
        },
    }, {
        $sort: { 'tag_info.order': 1 }
    }, {
        $unwind: '$tag_info'
    }, {
        $project: { _id: 0, tag: '$_id', name: '$tag_info.name' }
    })

    const tags = await Quest.aggregate(aggregateQuery);
    return tags;
}
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