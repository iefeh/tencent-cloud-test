import type { TaskItem } from '@/types/quest';
import { Tooltip, cn } from '@nextui-org/react';
import Image from 'next/image';
import closeImg from 'img/loyalty/earn/close.png';
import { FC, useLayoutEffect, useRef, useState } from 'react';
import TaskButtons from './TaskButtons';
import { QuestType } from '@/constant/task';
import ReverifyCountdown from './ReverifyCountdown';

interface Props {
  task: TaskItem;
  classNames?: {
    task?: string;
    connectBtn?: string;
    verifyBtn?: string;
  };
  onTaskUpdate?: (task: TaskItem) => void;
  onReverifyCDFinished?: () => void;
}

const MiniGameTask: FC<Props> = ({ task, classNames, onTaskUpdate, onReverifyCDFinished }) => {
  const [isContentVisible, setIsContentVisibble] = useState(false);
  const [needEllipsis, setNeedEllipsis] = useState(false);
  const shadowTextRef = useRef<HTMLDivElement>(null);

  function showContent() {
    setIsContentVisibble(true);
  }

  function hideContent() {
    setIsContentVisibble(false);
  }

  useLayoutEffect(() => {
    if (!shadowTextRef.current) return;

    const shadowWidth = shadowTextRef.current.clientWidth;
    const parentWidth = shadowTextRef.current.parentElement?.clientWidth || 0;
    if (shadowWidth > parentWidth) setNeedEllipsis(true);
  }, []);

  return (
    <div
      className={cn([
        'task-item col-span-1 overflow-hidden border-2 border-basic-gray rounded-[1.25rem] min-h-[17.5rem] pt-[2.5rem] px-[2.375rem] pb-[2.5rem] flex flex-col bg-light-yellow-1 hover:bg-white transition-colors duration-500 relative text-brown font-jcyt6 group',
        classNames?.task,
      ])}
    >
      <div className="task-name text-xl flex justify-between items-center">
        <div>{task.name}</div>

        {task.current_progress !== undefined && task.target_progress !== undefined && (
          <div className="text-base shrink-0 task-progress">
            (
            <span className="text-basic-yellow">
              {task.current_progress || 0}/{task.target_progress || '-'}
            </span>
            )
          </div>
        )}
      </div>

      <div className="mt-3 flex-1 flex flex-col justify-between relative">
        <div className="text-sm font-jcyt4">
          <Tooltip content={<div className="max-w-[25rem]">{task.description}</div>}>
            <div className="line-clamp-2 task-description" dangerouslySetInnerHTML={{ __html: task.description }}></div>
          </Tooltip>

          {task.tip && (
            <div className="flex items-center relative task-tips">
              <div
                className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis  max-h-[1.25rem]"
                dangerouslySetInnerHTML={{ __html: task.tip }}
              ></div>
              {needEllipsis && (
                <div
                  className="text-[#0763CA] shrink-0 cursor-pointer leading-6 underline  task-desc-view-more"
                  onClick={showContent}
                >
                  View More
                </div>
              )}

              <div
                ref={shadowTextRef}
                className="absolute invisible w-max whitespace-nowrap"
                dangerouslySetInnerHTML={{ __html: task.tip }}
              ></div>
            </div>
          )}
        </div>

        <div className="footer relative">
          <div className="flex items-center">
            <Image
              className="w-8 h-8"
              src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/campaign/reward/moonbeam/small-bg.png"
              alt=""
              width={64}
              height={64}
              unoptimized
            />

            <span className="text-base ml-[0.4375rem]">{task.reward.amount_formatted} Moon Beams</span>
          </div>

          <TaskButtons
            classNames={{ connectBtn: classNames?.connectBtn, verifyBtn: classNames?.verifyBtn }}
            task={task}
            onUpdate={onTaskUpdate}
          />

          {task.type === QuestType.ConnectWallet && task.verified && (task.properties?.can_reverify_after || 0) > 0 && (
            <ReverifyCountdown task={task} onFinished={onReverifyCDFinished} />
          )}
        </div>

        <div
          className={cn([
            'task-desc-content',
            'absolute z-0 h-full top-0 left-1/2 -translate-x-1/2 w-[25.875rem] overflow-hidden transition-[max-height] ease-in-out !duration-500',
            isContentVisible ? 'max-h-full' : 'max-h-0 pointer-events-none',
          ])}
        >
          <div className="w-full h-full rounded-[0.625rem] pt-8 px-6 pb-4 overflow-y-auto has-scroll-bar group-hover:bg-light-yellow-1 bg-white">
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: task.description }}></div>
            <div className="text-sm opacity-75 mt-[0.625rem]" dangerouslySetInnerHTML={{ __html: task.tip }}></div>
          </div>

          <Image
            className="w-3 h-3 absolute right-[0.625rem] top-[0.625rem] cursor-pointer"
            src={closeImg}
            alt=""
            unoptimized
            onClick={hideContent}
          />
        </div>
      </div>

      {task.is_new && (
        <div className="font-semakin text-xl text-transparent bg-clip-text bg-[linear-gradient(270deg,#EDE0B9_0%,#CAA67E_100%)] absolute right-4 top-2 p-2 z-10 task-new">
          NEW
        </div>
      )}
    </div>
  );
};

export default MiniGameTask;
