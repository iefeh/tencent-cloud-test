import type {NextApiResponse} from "next";
import { PipelineStage } from 'mongoose';
import { createRouter } from 'next-connect';

import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import UserLotteryDrawHistory from '@/lib/models/UserLotteryDrawHistory';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const { lottery_pool_id, page_num, page_size } = req.query;
  if (!page_num || !page_size || !lottery_pool_id) {
      res.json(response.invalidParams());
      return;
  }
  const lotteryPoolId = String(lottery_pool_id);
  const userId = req.userId;
  const pageNum = Number(page_num);
  const pageSize = Number(page_size);
  const pagination = await paginationLotteryHistory(lotteryPoolId, userId!, pageNum, pageSize);
  res.json(response.success({
      total: pagination.total,
      page_num: pageNum,
      page_size: pageSize,
      lotteryHistory: pagination.lotteryHistory,
  }));
  return;
});

async function paginationLotteryHistory(lotteryPoolId:string, userId: string, pageNum: number, pageSize: number): Promise<{ total: number, lotteryHistory: any[] }> {
  const skip = (pageNum - 1) * pageSize;
  const aggregateQuery: PipelineStage[] = [
      {
          $match: {
              'lottery_pool_id': lotteryPoolId,
              'user_id': userId,
              'deleted_time': null
          }
      },
      {
          $sort: {
              // 按照'draw_time'降序排序
              'draw_time': -1
          }
      },
      {
          $facet: {
              metadata: [{$count: "total"}],
              data: [{$skip: skip}, {$limit: pageSize}]
          }
      }
  ];
  const results = await UserLotteryDrawHistory.aggregate(aggregateQuery);
  if (results[0].metadata.length == 0) {
      return {total: 0, lotteryHistory: []}
  }
  return {total: results[0].metadata[0].total, lotteryHistory: results[0].data}
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