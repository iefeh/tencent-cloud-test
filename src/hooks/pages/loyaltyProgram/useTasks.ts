import { QuestType } from '@/constant/task';
import { queryTasksAPI } from '@/http/services/battlepass';
import { TaskListItem } from '@/http/services/task';
import type { TaskItem } from '@/types/quest';
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';

export default function useTasks(id?: string) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const pagiInfo = useRef<PagiInfo>({
    pageIndex: 1,
    pageSize: 9,
  });
  const [pagiTotal, setPagiTotal] = useState(0);

  const queryTasks = debounce(async function (pagi: PagiInfo = pagiInfo.current, noLoading = false) {
    if (!id) {
      Object.assign(pagiInfo.current, pagi);
      setPagiTotal(0);
      handleQuests([]);
      return;
    }

    if (!noLoading) setLoading(true);

    try {
      const { pageIndex, pageSize } = pagi;
      const params = { page_num: pageIndex, page_size: pageSize, category: id };
      const res = await queryTasksAPI(params);
      const { quests, total } = res;
      Object.assign(pagiInfo.current, pagi);
      setPagiTotal(Math.ceil((+total || 0) / pageSize));
      handleQuests(quests || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, 500);

  function handleQuests(list: TaskItem[]) {
    list.forEach((item) => {
      switch (item.type) {
        case QuestType.RetweetTweet:
          item.connectTexts = {
            label: 'Repost',
            finishedLable: 'Reposted',
          };
          break;
        case QuestType.JOIN_DISCORD_SERVER:
        case QuestType.HoldDiscordRole:
        case QuestType.Claim2048Ticket:
          item.connectTexts = {
            label: 'Join',
            finishedLable: 'Joined',
          };
          break;
        case QuestType.FollowOnTwitter:
          item.connectTexts = {
            label: 'Follow',
            finishedLable: 'Followed',
          };
          break;
        case QuestType.CommentTweet:
          item.connectTexts = {
            label: 'Comment',
            finishedLable: 'Commented',
          };
          break;
        case QuestType.ViewWebsite:
          item.connectTexts = {
            label: 'Visit',
            finishedLable: 'Visited',
          };
          break;
      }
    });

    setTasks(list);
  }

  function updateTaskById(item: TaskListItem) {
    const list = tasks.slice();
    const index = list.findIndex((task) => task.id === item.id);
    if (index < 0) return;

    list[index] = item;
    handleQuests(list);
  }

  useEffect(() => {
    pagiInfo.current.pageIndex = 1;
    setPagiTotal(0);
    setTasks([]);

    console.log(2334234, id);
    if (!id) return;

    queryTasks();
  }, [id]);

  return { pagiInfo, pagiTotal, loading, tasks, queryTasks, updateTaskById };
}
