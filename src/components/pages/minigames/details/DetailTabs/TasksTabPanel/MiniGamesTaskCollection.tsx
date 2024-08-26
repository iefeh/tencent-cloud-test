import type { TaskItem } from '@/types/quest';
import { cn } from '@nextui-org/react';
import type { FC } from 'react';
import MiniGameTask from './MiniGameTask';

interface Props extends ClassNameProps {
  items: TaskItem[];
  onTaskUpdate?: (task: TaskItem) => void;
}

const MiniGamesTaskCollection: FC<Props> = ({ className, onTaskUpdate, items }) => {
  return (
    <div className={cn(['mt-7 mb-[8.75rem] flex flex-col items-center relative', className])}>
      <div
        className={cn([
          'content flex flex-col lg:grid lg:grid-cols-3 gap-[1.5625rem] font-poppins w-full relative',
          items.length < 1 && 'h-[37.5rem]',
          className,
        ])}
      >
        {items.map((task) => (
          <MiniGameTask key={`${task.id}_${task.achieved}`} task={task} onTaskUpdate={onTaskUpdate} />
        ))}
      </div>
    </div>
  );
};

export default MiniGamesTaskCollection;
