import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { maybeAuthInterceptor, mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import BattlePassSeasons from '@/lib/models/BattlePassSeasons';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
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
  res.json(response.success());
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
