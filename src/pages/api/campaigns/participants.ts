import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Campaign, {CampaignStatus} from "@/lib/models/Campaign";
import {PipelineStage} from "mongoose";
import CampaignAchievement from "@/lib/models/CampaignAchievement";
import User from "@/lib/models/User";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
    const {page_num, page_size, campaign_id} = req.query;
    if (!page_num || !page_size || !campaign_id) {
        res.json(response.invalidParams());
        return
    }
    const pageNum = Number(page_num);
    const pageSize = Number(page_size);
    if (pageSize > 100) {
        res.json(response.invalidParams());
        return;
    }
    const pagination = await paginationParticipants(pageNum, pageSize, campaign_id as string);
    if (pagination.total == 0 || pagination.data.length == 0) {
        // 当前没有匹配的数据
        res.json(response.success({
            total: pagination.total,
            page_num: pageNum,
            page_size: pageSize,
            participants: pagination.data,
        }));
        return;
    }
    // 根据参与者的id获取用户信息
    const userIds = pagination.data.map((p: any) => p.user_id);
    const users = await User.find({user_id: {$in: userIds}, deleted_time: null}, {
        _id: 0,
        user_id: 1,
        username: 1,
        avatar_url: 1
    });
    // 根据用户id对用户进行重排序
    const participants = userIds.map(id => users.find(user => user.user_id === id));
    return res.json(response.success({
        total: pagination.total,
        page_num: pageNum,
        page_size: pageSize,
        participants: participants,
    }));
});

async function paginationParticipants(pageNum: number, pageSize: number, campaignId: string): Promise<{ total: number, data: any[] }> {
    const skip = (pageNum - 1) * pageSize;
    const aggregateQuery: PipelineStage[] = [
        {
            $match: {
                'campaign_id': campaignId,
                'claimed_time': {$gt: 0},
            },
        },
        {
            $sort: {
                // 按照结束时间倒序排列
                'claimed_time': -1
            }
        },
        {
            $project: {
                '_id': 0,
                'user_id': 1,
            }
        },
        {
            $facet: {
                metadata: [{$count: "total"}],
                data: [{$skip: skip}, {$limit: pageSize}]
            }
        }
    ];
    const results = await CampaignAchievement.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return {total: 0, data: []}
    }
    return {total: results[0].metadata[0].total, data: results[0].data}
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