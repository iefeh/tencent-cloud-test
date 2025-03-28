import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import {enrichUserQuests} from "@/lib/quests/questEnrichment";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
    const {quest_id} = req.query;
    if (!quest_id) {
        res.json(response.invalidParams());
        return
    }
    const userId = req.userId!;

    const quest = await Quest.findOne({id: quest_id, 'active': true, 'deleted_time': null}, {
        '_id': 0,
        '__v': 0,
        'deleted_time': 0,
        'created_time': 0,
        'updated_time': 0,
        'active': 0,
        'reward.range_reward_ids': 0,
    }).lean();
    if (!quest) {
        res.json(response.notFound("Unknown quest."));
        return;
    }
    // 目前有足够的任务数，丰富响应的数据
    await enrichUserQuests(userId!, [quest]);
    res.json(response.success({
        quest: quest,
    }));
});

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