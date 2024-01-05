import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import {PipelineStage} from 'mongoose';
import {enrichUserQuests} from "@/lib/quests/enrichment";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
    const {page_num, page_size} = req.query;
    if (!page_num || !page_size) {
        res.json(response.invalidParams());
        return
    }
    const pageNum = Number(page_num);
    const pageSize = Number(page_size);
    const userId = req.userId;
    await getMongoConnection();
    const pagination = await paginationQuests(pageNum, pageSize);
    if (pagination.total == 0) {
        // 当前没有匹配的数据
        res.json(response.success({
            total: 0,
            page_num: pageNum,
            page_size: pageSize,
            quests: pagination.quests,
        }));
        return;
    }
    // 目前有足够的任务数，丰富响应的数据
    const quests = pagination.quests;
    await enrichUserQuests(userId!, quests);
    res.json(response.success({
        total: pagination.total,
        page_num: pageNum,
        page_size: pageSize,
        quests: quests,
    }));
});

async function paginationQuests(pageNum: number, pageSize: number): Promise<{ total: number, quests: any[] }> {
    const skip = (pageNum - 1) * pageSize;
    const aggregateQuery: PipelineStage[] = [
        {
            $match: {
                'active': true,
                'deleted_time': null,
            }
        },
        {
            $project: {
                '_id': 0,
                '__v': 0,
                'deleted_time': 0,
                'created_time': 0,
                'updated_time': 0,
                'active': 0,
                'reward.range_reward_ids': 0,
            }
        },
        {
            $facet: {
                metadata: [{$count: "total"}],
                data: [{$skip: skip}, {$limit: pageSize}]
            }
        }
    ];
    const results = await Quest.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return {total: 0, quests: []}
    }
    return {total: results[0].metadata[0].total, quests: results[0].data}
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