import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { maybeAuthInterceptor, mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import BattlePassSeasons from '@/lib/models/BattlePassSeasons';
import UserBattlePassSeasons from '@/lib/models/UserBattlePassSeasons';
import doTransaction from "@/lib/mongodb/transaction";
import { getUserBattlePass, updateUserBattlepassMetricAndBadgeCheck } from "@/lib/battlepass/battlepass";
import UserMetrics from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessages } from '@/lib/kafka/client';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
  // const userId: string = "f5306be3-30d1-4e09-adc3-dc7bfdf7ee8d";
  
  // await doTransaction(async (session) => {
  //   const opts = { session };

  //   await updateUserBattlepassMetricAndBadgeCheck(userId, "d00d4110-3f6a-4349-8c70-399e10dc45dd", 10, undefined);
  // });
  const t:Map<String,String> = new Map();
  console.log(t.get("1"));

  res.json(response.success());
});

async function campaignUpdate() {
  const userId: string = "f5306be3-30d1-4e09-adc3-dc7bfdf7ee8d";
  await doTransaction(async (session) => {
    const opts = { session };

    //用户是否已有赛季通行证
    await UserBattlePassSeasons.updateOne({ user_id: userId, battlepass_season_id: 1 }, {
      $inc: { finished_tasks: 1, total_moon_beam: 5 },
      updated_time: Date.now()
    }, { upsert: true, session: session });
    let metricUpdateDoc: any = {};
    let userBattlePass: any = await getUserBattlePass(userId);
    metricUpdateDoc[`battlepass_season_${userBattlePass.battlepass_season_id}_standard_pass`] = userBattlePass.finished_tasks + 1;
    if (true) {
      metricUpdateDoc[`battlepass_season_${userBattlePass.battlepass_season_id}_premium_pass`] = userBattlePass.finished_tasks + 1;
    }
    console.log(metricUpdateDoc);
    await UserMetrics.updateOne({ user_id: userId }, metricUpdateDoc, { upsert: true, session: session });
    await sendBadgeCheckMessages(userId, metricUpdateDoc);
  });

}
async function insertSeaon() {
  await BattlePassSeasons.insertMany([
    {
      id: 1,
      standard_pass: {
        1: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_standard_pass', operator: '>=', value: 5 } },
          ],
          reward_moon_beam: 25,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        2: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_standard_pass', operator: '>=', value: 15 } },
          ],
          reward_moon_beam: 50,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        3: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_standard_pass', operator: '>=', value: 30 } },
          ],
          reward_moon_beam: 75,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        4: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_standard_pass', operator: '>=', value: 50 } },
          ],
          reward_moon_beam: 100,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        5: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_standard_pass', operator: '>=', value: 76 } },
          ],
          reward_moon_beam: 130,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        6: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_standard_pass', operator: '>=', value: 108 } },
          ],
          reward_moon_beam: 160,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        7: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_standard_pass', operator: '>=', value: 145 } },
          ],
          reward_moon_beam: 185,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        8: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_standard_pass', operator: '>=', value: 190 } },
          ],
          reward_moon_beam: 225,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        9: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_standard_pass', operator: '>=', value: 240 } },
          ],
          reward_moon_beam: 250,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        10: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_standard_pass', operator: '>=', value: 300 } },
          ],
          reward_moon_beam: 300,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
      },
      premium_pass: {
        1: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_premium_pass', operator: '>=', value: 5 } },
          ],
          reward_moon_beam: 25,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        2: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_premium_pass', operator: '>=', value: 15 } },
          ],
          reward_moon_beam: 50,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        3: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_premium_pass', operator: '>=', value: 30 } },
          ],
          reward_moon_beam: 75,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        4: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_premium_pass', operator: '>=', value: 50 } },
          ],
          reward_moon_beam: 100,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        5: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_premium_pass', operator: '>=', value: 76 } },
          ],
          reward_moon_beam: 130,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        6: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_premium_pass', operator: '>=', value: 108 } },
          ],
          reward_moon_beam: 160,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        7: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_premium_pass', operator: '>=', value: 145 } },
          ],
          reward_moon_beam: 185,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        8: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_premium_pass', operator: '>=', value: 190 } },
          ],
          reward_moon_beam: 225,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        9: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_premium_pass', operator: '>=', value: 240 } },
          ],
          reward_moon_beam: 250,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
        10: {
          requirements: [
            { type: 'metric', properties: { metric: 'battlepass_season_1_premium_pass', operator: '>=', value: 300 } },
          ],
          reward_moon_beam: 300,
          badge_id: '0275b2ef-6efb-5b47-9559-cb2e3ed5996a'
        },
      },
      start_time: Date.now(),
      created_time: Date.now(),
      end_time: Date.now() + 1000000000,
    },
  ]);
}
async function insertUserSeason() {
  await UserBattlePassSeasons.insertMany([
    {
      "user_id": "f5306be3-30d1-4e09-adc3-dc7bfdf7ee8d",
      "battlepass_season_id": 1,
      "started": false,
      "finished_tasks": 0,
      "max_lv": 0,
      "type": "premium_pass",
      "reward_records": {
        "standard": {
          "1": {
            "satisfied_time": 1711620230741
          }
        },
        "premium": {
          "1": {
            "satisfied_time": 1711620230741
          }
        }
      },
      "total_moon_beam": 0,
      "created_time": 1711620230741,
      "updated_time": 1711620230741
    }
  ]);
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
