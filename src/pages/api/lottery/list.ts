import type {NextApiResponse} from "next";
import { PipelineStage } from 'mongoose';
import { createRouter } from 'next-connect';

import { enrichRequirementsInfo, lotteryRequirementSatisfy } from '@/lib/lottery/lottery';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import LotteryPool, { LotteryPoolType } from '@/lib/models/LotteryPool';
import LotteryPoolRequirement from '@/lib/models/LotteryPoolRequirements';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();

enum LotteryPoolOpenStatus {
  ALL = 'all',
  COMING_SOON = 'comming_soon',
  IN_PROGRESS = 'in_progress',
  ENDED = 'ended'
}

router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const { page_num, page_size, open_status } = req.query;
  if (!page_num || !page_size) {
    return res.json(response.invalidParams({ message: "Required parameter is missing."}));
  }
  const pageNum: number = Number(page_num);
  const pageSize: number = Number(page_size);
  if(pageNum <= 0 || pageSize <= 0){
    return res.json(response.invalidParams());
  }
  const userId = String(req.userId);
  const pagination = await paginationLotteryPools(pageNum, pageSize, open_status as string);
  const now = Date.now();
  let result: any[] = [];
  for (let pool of pagination.data) {
    const requirements = await LotteryPoolRequirement.find({ lottery_pool_id: pool.lottery_pool_id }, { type: 1, description: 1, properties: 1, _id: 0 });
    const requirementSatisfy = await lotteryRequirementSatisfy(userId, pool.lottery_pool_id);
    await enrichRequirementsInfo(requirements);
    let openStatus = LotteryPoolOpenStatus.ALL;
    if (pool.start_time > now) {
      openStatus = LotteryPoolOpenStatus.COMING_SOON;
    } else if (pool.start_time <= now && pool.end_time >= now) {
      openStatus = LotteryPoolOpenStatus.IN_PROGRESS;
    } else {
      openStatus = LotteryPoolOpenStatus.ENDED;
    }
    let rewards: any[] = [];
    for (let reward of pool.rewards) {
      if (reward.reward_level >= 5) {
        rewards.push({
          reward_name: reward.reward_name,
          reward_level: reward.reward_level,
          icon_url: reward.icon_url
        });
      }
    }
    result.push({
      lottery_pool_id: pool.lottery_pool_id,
      name: pool.name,
      requirements: requirements,
      user_meet_requirement_type: requirementSatisfy.requirement_type,
      user_meet_requirement: requirementSatisfy.meet_requirement,
      icon_url: pool.icon_url,
      icon_frame_level: pool.icon_frame_level,
      limited_qty: pool.limited_qty,
      start_time: pool.start_time,
      end_time: pool.end_time,
      open_status: openStatus,
      limited_rewards: rewards
    });
  }
  return res.json(response.success({
    total: pagination.total,
    page_num: pageNum,
    page_size: pageSize,
    lottery_pools: result,
  }));
});

async function paginationLotteryPools(pageNum: number, pageSize: number, open_status?: string): Promise<{ total: number, data: any[] }> {
  const now = Date.now()
  const skip = (pageNum - 1) * pageSize;
  let matchOpt: any = {
    $match: {
      active: true,
      type: LotteryPoolType.Public
    }
  };
  if (open_status) {
    switch (open_status) {
      case LotteryPoolOpenStatus.COMING_SOON:
        matchOpt.$match.start_time = { $gt: now };
        break;
      case LotteryPoolOpenStatus.IN_PROGRESS:
        matchOpt.$match.start_time = { $lte: now };
        matchOpt.$match.end_time = { $gte: now};
        break;
      case LotteryPoolOpenStatus.ENDED:
        matchOpt.$match.end_time = { $lt: now };
        break;
    }
  }
  //查询兑换历史信息
  const pipeline: PipelineStage[] = [
  matchOpt,
  {
    $sort: {
      'start_time': -1
    }
  },
  {
    $project: {
      _id: 0,
      lottery_pool_id: 1,
      name: 1,
      icon_url: 1,
      icon_frame_level: 1,
      limited_qty: 1,
      rewards: 1,
      start_time: 1,
      end_time: 1
    }
  },
  {
    $facet: {
      metadata: [{ $count: "total" }],
      data: [{ $skip: skip }, { $limit: pageSize }]
    }
  }]
  const history: any = await LotteryPool.aggregate(pipeline);

  if (history[0].metadata.length == 0) {
    return { total: 0, data: [] }
  }

  return { total: history[0].metadata[0].total, data: history[0].data };
}

// this will run if none of the above matches
router.all((req, res) => {
  res.status(405).json({
    error: 'Method not allowed',
  });
});

export default router.handler({
  onError(err, req, res) {
    console.error(err);
    res.status(500).json(response.serverError());
  },
});