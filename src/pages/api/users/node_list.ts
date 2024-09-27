import type { NextApiResponse } from "next";
import { PipelineStage } from 'mongoose';
import { createRouter } from 'next-connect';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import * as response from '@/lib/response/response';
import UserNodeEligibility, { NodeSourceType } from "@/lib/models/UserNodeEligibility";
import Quest from "@/lib/models/Quest";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    const userId = req.userId!;

    const nodes: any[] = await getUserNodes(userId);

    // new UserNodeEligibility({ user_id: userId, node_tier: 1, node_amount: 1, source_type: NodeSourceType.Quest, source_id: "d00d4110-3f6a-4349-8c70-399e10dc45dd", created_time: Date.now() }).save();

    return res.json(response.success({
        nodes: nodes
    }));
});

async function getUserNodes(userId: string) {
    // 查询出用户的节点
    const pipeline: PipelineStage[] = [{ $match: { user_id: userId } }, { $sort: { created_time: -1 } }, { $project: { _id: 0, __v: 0 } }];
    const nodes: any[] = await UserNodeEligibility.aggregate(pipeline);

    const sourceIds: string[] = nodes.filter(n => n.source_type == NodeSourceType.Quest).map(n => n.source_id);
    let questNameMap: Map<string, string> | undefined;

    if (sourceIds.length > 0) {
        const quests: any[] = await Quest.find({ id: { $in: sourceIds } }, { _id: 0, id: 1, name: 1 });
        questNameMap = new Map<string, string>(quests.map(q => [q.id, q.name]));
    }

    for (let n of nodes) {
        if (n.source_type == NodeSourceType.Quest && questNameMap) {
            n.source = questNameMap.get(n.source_id);
        } else {
            n.source = n.source_id;
        }
        delete n.user_id;
        delete n.source_id;
        delete n.source_type;
    }

    return nodes;
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