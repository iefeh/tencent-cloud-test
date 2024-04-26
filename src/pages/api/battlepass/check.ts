import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import BattlePassSeasons from '@/lib/models/BattlePassSeasons';
import UserMetrics from '@/lib/models/UserMetrics';
import { errorInterceptor } from '@/lib/middleware/error';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const user_id = req.userId;
  const userId = String(user_id);

  //获得当前赛季
  const now: Number = Date.now();
  const current_season = await BattlePassSeasons.findOne({ start_time: { $lte: now }, end_time: { $gte: now } });
  const userMetric: any = UserMetrics.findOne({ user_id: userId });
  let mandatory: any[] = [];
  let optional: any[] = [];
  let mandatory_satisfied: number = 0;
  let optional_satisfied: number = 0;
  let check_pass: boolean = false;
  console.log(current_season);
  for (let c of current_season.precondition_config.preconditions) {
    c.satisfied = userMetric[c.metric] === 1;
    if (c.mandatory) {
      mandatory.push(c);
      if (c.satisfied) {
        mandatory_satisfied++;
      }
    } else {
      optional.push(c);
      if (c.satisfied) {
        optional_satisfied++;
      }
    }
  }
  //判断是否达成条件
  if (
    mandatory_satisfied === mandatory.length &&
    optional_satisfied >= current_season.precondition_config.optional_metric_require
  ) {
    check_pass = true;
  }
  res.json(
    response.success({
      check_pass: check_pass,
      mandatory_satisfied: mandatory_satisfied,
      mandatory_count: mandatory.length,
      optional_satisfied: optional_satisfied,
      optional_requireed: current_season.precondition_config.optional_metric_require,
      optional_count: optional.length,
      mandatory: mandatory,
      optional: optional,
    }),
  );
});

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
