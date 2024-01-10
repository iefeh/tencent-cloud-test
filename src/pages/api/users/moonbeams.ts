import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import logger from "@/lib/logger/winstonLogger";
import Quest from "@/lib/models/Quest";
import {PipelineStage} from "mongoose";
import UserMoonBeamAudit, {UserMoonBeamAuditType} from "@/lib/models/UserMoonBeamAudit";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    const {page_num, page_size} = req.query;
    if (!page_num || !page_size) {
        res.json(response.invalidParams());
        return
    }
    const pageNum = Number(page_num);
    const pageSize = Number(page_size);

    const userId = req.userId!;
    await getMongoConnection();
    const pagination = await paginationUserMoonbeams(userId, pageNum, pageSize);
    if (pagination.total == 0) {
        // 当前没有匹配的数据
        res.json(response.success({
            total: 0,
            page_num: pageNum,
            page_size: pageSize,
            quests: pagination.mbs,
        }));
        return;
    }
    // 查询奖励细节
    const mbs = pagination.mbs;
    const questIds = mbs.filter(mb => mb.type === UserMoonBeamAuditType.Quests).map(mb => mb.quest_id);
    const quests = await Quest.find({id: {$in: questIds}}, {_id: 0, id: 1, name: 1});
    const questNameMap = new Map<string, string>(quests.map(quest => [quest.id, quest.name]));
    mbs.forEach(quest => {
        if (quest.type !== UserMoonBeamAuditType.Quests) {
            return;
        }
        quest.name = questNameMap.get(quest.quest_id) || '';
    })
    res.json(response.success({
        total: pagination.total,
        page_num: pageNum,
        page_size: pageSize,
        quests: mbs,
    }));
});

async function paginationUserMoonbeams(userId: string, pageNum: number, pageSize: number): Promise<{ total: number, mbs: any[] }> {
    const skip = (pageNum - 1) * pageSize;
    const aggregateQuery: PipelineStage[] = [
        {
            $match: {
                user_id: userId,
                deleted_time: null,
            }
        },
        {
            $project: {
                _id: 0,
                type: 1,
                moon_beam_delta: 1,
                created_time: 1,
                quest_id: "$corr_id",
            }
        },
        {
            $facet: {
                metadata: [{$count: "total"}],
                data: [{$skip: skip}, {$limit: pageSize}]
            }
        }
    ];
    const results = await UserMoonBeamAudit.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return {total: 0, mbs: []}
    }
    return {total: results[0].metadata[0].total, mbs: results[0].data}
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