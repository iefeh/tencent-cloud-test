import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import CDKRedeemRecord from '@/lib/models/CDKRedeemRecord';
import CDK from '@/lib/models/CDK';
import { PipelineStage } from 'mongoose';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  //获取页码信息
  const { page_num, page_size } = req.query
  if (!page_num || !page_size) {
    res.json(response.invalidParams());
    return;
  }

  //查询CDK兑换历史
  const userId = req.userId!;
  const pageNum: number = Number(page_num);
  const pageSize: number = Number(page_size);
  //查询CDK的奖励信息
  const pagination: any = await paginationCDKRedeemHistory(userId, pageNum, pageSize);

  res.json(response.success({
    total: pagination.total,
    page_num: pageNum,
    page_size: pageSize,
    histories: pagination.data,
  }));
});

//分页查询CDK的信息
async function paginationCDKRedeemHistory(userId: string, pageNum: number, pageSize: number): Promise<{ total: number, data: any[] }> {
  const skip = (pageNum - 1) * pageSize;

  //查询兑换历史信息
  const pipeline: PipelineStage[] = [{
    $match: {
      redeem_user_id: userId
    }
  },
  {
    $sort: {
      'redeem_time': -1
    }
  }, {
    $lookup: {
      from: 'cdk',
      let: { cdk: '$cdk' },
      pipeline: [
        {
          $match: { $expr: { $and: [{ $eq: ['$cdk', '$$cdk'] }] } },
        },
        {
          $project: { _id: 0 }
        }
      ],
      as: 'cdk_info',
    }
  },
  {
    $unwind: '$cdk_info'
  },
  {
    $lookup: {
      from: 'cdk_template',
      let: { id: '$cdk_info.template_id' },
      pipeline: [
        {
          $match: { $expr: { $and: [{ $eq: ['$id', '$$id'] }] } },
        },
        {
          $project: {
            _id: 0,
            'rewards.alert': 0
          }
        }
      ],
      as: 'template',
    }
  },
  {
    $unwind: '$template'
  },
  {
    $project: {
      _id: 0,
      cdk: 1,
      redeem_time: 1,
      rewards: '$template.rewards'
    }
  },
  {
    $facet: {
      metadata: [{ $count: "total" }],
      data: [{ $skip: skip }, { $limit: pageSize }]
    }
  }]
  const history: any = await CDKRedeemRecord.aggregate(pipeline);

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
