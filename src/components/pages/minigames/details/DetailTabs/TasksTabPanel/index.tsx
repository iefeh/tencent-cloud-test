import type { FC } from 'react';
import { useMGDContext } from '@/store/MiniGameDetails';
import MiniGamesTaskCollection from './MiniGamesTaskCollection';

const TasksTabPanel: FC = () => {
  const { data } = useMGDContext();
  const { tasks } = data || {};

  return (
    <div>
      <MiniGamesTaskCollection items={tasks || []} />
    </div>
  );
};

export default TasksTabPanel;
