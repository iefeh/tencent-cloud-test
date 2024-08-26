import type { FC } from 'react';
import { useMGDContext } from '@/store/MiniGameDetails';
import MiniGamesTaskCollection from './MiniGamesTaskCollection';
import type { TaskItem } from '@/types/quest';
import { observer } from 'mobx-react-lite';

const TasksTabPanel: FC = () => {
  const { data, setData } = useMGDContext();
  const { tasks } = data || {};

  function onTaskUpdate(item: TaskItem) {
    const list = (tasks || []).slice();
    const index = list.findIndex((task) => task.id === item.id);
    if (index < 0) return;

    list[index] = item;
    setData({ ...data!, tasks: list });
  }

  return (
    <div>
      <MiniGamesTaskCollection items={tasks || []} onTaskUpdate={onTaskUpdate} />
    </div>
  );
};

export default observer(TasksTabPanel);
