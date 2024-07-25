import { Pagination, cn } from '@nextui-org/react';
import PaginationRenderItem from './PaginationRenderItem';
import { observer } from 'mobx-react-lite';
import CircularLoading from '@/pages/components/common/CircularLoading';
import useTasks from '@/hooks/pages/loyaltyProgram/useTasks';
import Task from './Task';

interface Props extends ClassNameProps {
  id?: string;
  hidePagi?: boolean;
}

function RegularTasksCollection({ id, className, hidePagi }: Props) {
  const { tasks, pagiInfo, pagiTotal, loading: taskListLoading, queryTasks, updateTaskById } = useTasks(id || '');

  function onPagiChange(page: number) {
    if (page === pagiInfo.current.pageIndex) return;

    const pagi = { ...pagiInfo.current, pageIndex: page };
    queryTasks(pagi);
  }

  return (
    <>
      <div
        className={cn([
          'content flex flex-col lg:grid lg:grid-cols-3 gap-[1.5625rem] font-poppins w-full relative',
          tasks.length < 1 && 'h-[37.5rem]',
          className,
        ])}
      >
        {tasks.map((task) => (
          <Task
            key={`${task.id}_${task.achieved}`}
            task={task}
            onTaskUpdate={updateTaskById}
            onReverifyCDFinished={queryTasks}
          />
        ))}

        {taskListLoading && <CircularLoading />}
      </div>

      {!hidePagi && pagiTotal > 0 && (
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
      )}
    </>
  );
}

export default observer(RegularTasksCollection);
