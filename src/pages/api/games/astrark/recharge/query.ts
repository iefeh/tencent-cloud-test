import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import { ThinkingDataQueryQuest } from "@/lib/quests/implementations/thinkingDataQueryQuest";
import { ThinkingDataQuery } from "@/lib/quests/types";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    const userId = req.userId!;
    const [total, rebate] = await queryTotalRecharge(userId);
    res.json(response.success({ total: total, reabte: rebate }));
});

export async function queryTotalRecharge(userId: string): Promise<[number, number]> {
    const quest = await Quest.findOne({ id: 'astrark-recharge-query' });
    const queryQuest = new ThinkingDataQueryQuest(quest);
    const questProp = quest.properties as ThinkingDataQuery;
    const result = await queryQuest.checkUserQuestFromThinkingData(questProp, userId);

    if (!result) {
        return [0, 0];
    }
    const total = Number(Number(result[1][0]).toFixed(2));
    let rebate: number;
    
    if (total <= 200) {
        rebate = 1.5;
    } else if (total <= 800) {
        rebate = 1.2;
    } else {
        rebate = 1;
    }

    return [total, rebate];
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