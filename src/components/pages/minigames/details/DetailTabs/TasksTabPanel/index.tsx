import RegularTasksList from '@/components/LoyaltyProgram/task/RegularTasksList';
import { cn } from '@nextui-org/react';
import { FC } from 'react';
import styles from './index.module.scss';
import { useMGDContext } from '@/store/MiniGameDetails';
import MiniGamesTaskCollection from './MiniGamesTaskCollection';

const TasksTabPanel: FC = () => {
  const { data } = useMGDContext();
  const { tasks } = data || {};

  return (
    <div>
      {/* <RegularTasksList
        categoryItem={{ id: process.env.NEXT_PUBLIC_TASK_CATEGORY_ID_2048 }}
        hidePagi
        hideHeader
        classNames={{
          task: cn([
            'bg-[#F7E9CC] border-2 border-basic-gray transition-colors font-jcyt6',
            'text-brown',
            'hover:border-basic-gray hover:bg-white',
            styles.puffyTask
          ]),
          connectBtn: styles.puffyConnectBtn,
          verifyBtn: styles.puffyVerifyBtn,
        }}
      /> */}
      <MiniGamesTaskCollection items={tasks || []} />
    </div>
  );
};

export default TasksTabPanel;
