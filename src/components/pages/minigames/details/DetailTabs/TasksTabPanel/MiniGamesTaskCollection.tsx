import { TaskItem } from '@/types/quest';
import { Pagination, cn } from '@nextui-org/react';
import { FC } from 'react';
import MiniGameTask from './MiniGameTask';
import CircularLoading from '@/pages/components/common/CircularLoading';

interface Props extends ClassNameProps {
  hidePagi?: boolean;
  items: TaskItem[];
}

const MiniGamesTaskCollection: FC<Props> = ({ className, hidePagi, items }) => {
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
          <MiniGameTask
            key={`${task.id}_${task.achieved}`}
            // classNames={{
            //   task: classNames?.task,
            //   connectBtn: classNames?.connectBtn,
            //   verifyBtn: classNames?.verifyBtn,
            // }}
            task={task}
            // onTaskUpdate={updateTaskById}
            // onReverifyCDFinished={queryTasks}
          />
        ))}

        {/* {taskListLoading && <CircularLoading />} */}
      </div>

      {/* {!hidePagi && pagiTotal > 0 && (
        <Pagination
          className="mt-[4.6875rem]"
          showControls
          total={pagiTotal}
          initialPage={1}
          renderItem={PaginationRenderItem}
          classNames={{
            wrapper: 'gap-3',
            item: 'w-12 h-12 font-poppins-medium text-base text-white',
          }}
          disableCursorAnimation
          radius="full"
          variant="light"
          onChange={onPagiChange}
        />
      )} */}
    </div>
  );
};

export default MiniGamesTaskCollection;
