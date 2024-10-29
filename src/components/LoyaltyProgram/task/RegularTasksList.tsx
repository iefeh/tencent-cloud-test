import Image from 'next/image';
import { Pagination, cn } from '@nextui-org/react';
import { TaskCategory } from '@/http/services/battlepass';
import arrowIcon from 'img/loyalty/task/icon_arrow.png';
import PaginationRenderItem from './PaginationRenderItem';
import CircularLoading from '@/pages/components/common/CircularLoading';
import useTasks from '@/hooks/pages/loyaltyProgram/useTasks';
import Task from './Task';
import { observer } from 'mobx-react-lite';
import EmptyContent from '@/components/common/EmptyContent';
import { useUserContext } from '@/store/User';

interface Props extends ClassNameProps {
  hideHeader?: boolean;
  hidePagi?: boolean;
  categoryItem?: Partial<TaskCategory> | null;
  classNames?: {
    task?: string;
    connectBtn?: string;
    verifyBtn?: string;
  };
  onBack?: () => void;
}

function RegularTasksList({ categoryItem, hideHeader, hidePagi, className, classNames, onBack }: Props) {
  const { userInfo } = useUserContext();
  const {
    tasks,
    pagiInfo,
    pagiTotal,
    loading: taskListLoading,
    queryTasks,
    updateTaskById,
  } = useTasks(categoryItem?.id || '');

  function onPagiChange(page: number) {
    if (page === pagiInfo.current.pageIndex) return;

    const pagi = { ...pagiInfo.current, pageIndex: page };
    queryTasks(pagi);
  }

  return (
    <div className={cn(['mt-7 mb-[8.75rem] flex flex-col items-center relative', className])}>
      {hideHeader || (
        <div className="self-start mb-8">
          <div className="flex items-center cursor-pointer" onClick={onBack}>
            <Image className="w-[1.625rem] h-[1.375rem]" src={arrowIcon} alt="" width={26} height={22} />

            <span className="ml-3 text-2xl text-[#666666]">BACK</span>
          </div>

          {categoryItem?.name && <div className="text-2xl mt-6">{categoryItem?.name || '--'}</div>}
        </div>
      )}

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
            classNames={{
              task: classNames?.task,
              connectBtn: classNames?.connectBtn,
              verifyBtn: classNames?.verifyBtn,
            }}
            task={task}
            onTaskUpdate={updateTaskById}
            onReverifyCDFinished={queryTasks}
          />
        ))}

        {taskListLoading && <CircularLoading />}

        {!taskListLoading && pagiTotal < 1 && (
          <EmptyContent
            content={
              userInfo
                ? 'More exciting tasks coming soon.<br/>Stay tuned!'
                : 'Please log in and claim your season pass first to unlock tasks & events.'
            }
          />
        )}
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
    </div>
  );
}

export default observer(RegularTasksList);
