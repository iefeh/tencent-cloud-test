import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { UserContextRequest } from '@/lib/middleware/auth';
import TaskTab from '@/lib/models/TaskTab';

const router = createRouter<UserContextRequest, NextApiResponse>();
let tabs: any[] = [];
let taskTabRefreshTime: number = 0;

export const queryQuestTabs = async () => {
  const now = Date.now();

  if (now - taskTabRefreshTime < 60 * 1000) return tabs;

  const items = await TaskTab.find(
    { active: true, start_time: { $lte: now }, end_time: { $gte: now } },
    { _id: 0, active: 0, start_time: 0, end_time: 0 },
    { sort: { order: 1 } },
  )
    .lean()
    .exec();
  tabs = items;
  taskTabRefreshTime = now;

  return tabs;
};

router.get(async (req, res) => {
  const tabs = await queryQuestTabs();
  res.json(response.success(tabs));
  return;
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
