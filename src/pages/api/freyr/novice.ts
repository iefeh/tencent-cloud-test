import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import Badges from '@/lib/models/Badge';
import UserBadges from '@/lib/models/UserBadges';
import { CallbackTaskType, upsertCallbackTaskOverview } from '@/lib/models/CallbackTaskOverview';
import { queryUserId } from '@/lib/freyr/userQuery';
import * as Sentry from '@sentry/nextjs';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  let { email, address } = req.query;
  if (!email || email === '' || (Array.isArray(email) && email.length === 0)) {
    // 本API所有报错均返回200，completed = false，并提供相应信息，下同
    res.json(
      response.success({
        completed: false,
        msg: 'Parameter email is missing.',
      }),
    );
    return;
  }

  if (Array.isArray(email)) {
    email = email[0];
  }

  if (Array.isArray(address)) {
    if (address.length > 0) {
      address = address[0];
    } else {
      address = '';
    }
  } else if (address === undefined) {
    address = '';
  }

  try {
    const userId = await queryUserId(email, address);
    if (userId === '') {
      res.json(
        response.success({
          completed: false,
          msg: 'User not found.',
        }),
      );
      return;
    }

    // get Novice Notch badge id
    const noviceNotchBadge = await Badges.findOne({ name: 'Novice Notch' });
    if (!noviceNotchBadge) {
      // 本API在内部报错时直接返回false而不是500
      res.json(
        response.success({
          completed: false,
        }),
      );
      return;
    }

    const badgeId = noviceNotchBadge.id;

    // get user badge status
    const noviceNotchBadgeObtained = await checkNoviceNotchBadgeObtained(userId, badgeId);

    // upsert CallbackTaskOverview
    await upsertCallbackTaskOverview(userId, CallbackTaskType.FREYR_NOVICE_NOTCH, noviceNotchBadgeObtained);

    res.json(
      response.success({
        completed: noviceNotchBadgeObtained,
      }),
    );
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);

    // 本API在内部报错时直接返回false而不是500
    res.json(
      response.success({
        completed: false,
      }),
    );
  }
});

async function checkNoviceNotchBadgeObtained(userId: string, badgeId: string) {
  const userBadge = await UserBadges.findOne({ badge_id: badgeId, user_id: userId });
  if (!userBadge) {
    return false;
  }

  if (!userBadge.series || userBadge.series.size < 1) {
    return false;
  }

  return true;
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
