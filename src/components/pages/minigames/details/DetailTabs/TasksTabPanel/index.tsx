import RegularTasksCollection from '@/components/LoyaltyProgram/task/RegularTasksCollection';
import { FC } from 'react';

const TasksTabPanel: FC = () => {
  return (
    <div>
      <RegularTasksCollection id={process.env.NEXT_PUBLIC_TASK_CATEGORY_ID_2048} hidePagi />
    </div>
  );
};

export default TasksTabPanel;
