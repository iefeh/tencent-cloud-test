import { useState, type FC, useEffect } from 'react';
import { useMGDContext } from '@/store/MiniGameDetails';
import MiniGamesTaskCollection from './MiniGamesTaskCollection';
import type { TaskItem } from '@/types/quest';
import { observer } from 'mobx-react-lite';
import { queryMiniGameTasksAPI } from '@/http/services/minigames';
import CircularLoading from '@/pages/components/common/CircularLoading';
import EmptyContent from '@/components/common/EmptyContent';
import { cn } from '@nextui-org/react';
import { isMobile } from 'react-device-detect';

const TasksTabPanel: FC = () => {
  const { data } = useMGDContext();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function queryTasks() {
    if (!data?.client_id) {
      setTasks([]);
      return;
    }

    setLoading(true);
    const res = await queryMiniGameTasksAPI({ client_id: data.client_id });
    setTasks(res?.tasks || []);
    setLoading(false);
  }

  function onTaskUpdate(item: TaskItem) {
    const list = (tasks || []).slice();
    const index = list.findIndex((task) => task.id === item.id);
    if (index < 0) return;

    list[index] = item;
    setTasks(list);
  }

  useEffect(() => {
    queryTasks();
  }, [data]);

  return (
    <div
      className={cn([
        'min-h-[15rem] relative rounded-base overflow-hidden',
        !isMobile && tasks.length < 1 && 'h-[36rem]',
      ])}
    >
      {loading ? (
        <CircularLoading />
      ) : tasks.length < 1 ? (
        <EmptyContent />
      ) : (
        <MiniGamesTaskCollection items={tasks} onTaskUpdate={onTaskUpdate} />
      )}
    </div>
  );
};

export default observer(TasksTabPanel);
