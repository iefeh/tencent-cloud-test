import type { TaskItem } from '@/types/quest';
import { Tooltip, cn } from '@nextui-org/react';
import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import closeImg from 'img/loyalty/earn/close.png';
import { FC, useLayoutEffect, useRef, useState } from 'react';
import TaskButtons from './TaskButtons';
import { QuestType } from '@/constant/task';
import ReverifyCountdown from './ReverifyCountdown';
import TokenRewardProgress from './TokenRewardProgress';
import LGButton from '@/pages/components/common/buttons/LGButton';
import useClaimToken from '@/components/profile/MyTokens/useClaimToken';
import { taskDetailsAPI } from '@/http/services/task';

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

const Task: FC<Props> = ({ task, classNames, onTaskUpdate, onReverifyCDFinished }) => {
  const [isContentVisible, setIsContentVisibble] = useState(false);
  const [needEllipsis, setNeedEllipsis] = useState(false);
  const shadowTextRef = useRef<HTMLDivElement>(null);
  const hasTokenReward = !!task.reward.token_reward;
  const { loading, onClaim } = useClaimToken({
    updateList: async () => {
      const res = await taskDetailsAPI({ quest_id: task.id });
      if (!res) return;
      return onTaskUpdate?.(res.quest);
    },
  });

  function getProgressStatus() {
    const { actual_raffle_time, estimated_raffle_time } = task.reward.token_reward || {};
    if (!!actual_raffle_time) return 2;

    const now = Date.now();
    if (estimated_raffle_time && now > +estimated_raffle_time) return 1;

    return 0;
  }

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
        'task-item col-span-1 overflow-hidden border-1 border-basic-gray rounded-[0.625rem] min-h-[17.5rem] px-[2.375rem] pb-[2.5rem] flex flex-col hover:border-basic-yellow transition-[border-color] duration-500 relative',
        hasTokenReward ? 'pt-[1.25rem]' : 'pt-[2.5rem]',
        classNames?.task,
      ])}
    >
      {hasTokenReward && <TokenRewardProgress status={getProgressStatus()} />}

      <div className={cn(['task-name text-xl flex justify-between items-center', hasTokenReward && 'mt-12'])}>
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
        <div className="text-sm">
          <Tooltip content={<div className="max-w-[25rem]">{task.description}</div>}>
            <div
              className="text-[#999] line-clamp-2 task-description"
              dangerouslySetInnerHTML={{ __html: task.description }}
            ></div>
          </Tooltip>

          {task.tip && (
            <div className="flex items-center relative task-tips">
              <div
                className="flex-1 text-[#999] overflow-hidden whitespace-nowrap text-ellipsis  max-h-[1.25rem]"
                dangerouslySetInnerHTML={{ __html: task.tip }}
              ></div>
              {needEllipsis && (
                <div
                  className="text-basic-yellow shrink-0 cursor-pointer leading-6 border-b-1 border-basic-yellow task-desc-view-more"
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
            <Image className="w-8 h-8" src={mbImg} alt="" unoptimized />

            <span className="font-semakin text-base text-basic-yellow ml-[0.4375rem]">
              {task.reward.amount_formatted} Moon Beams
            </span>
          </div>

          {task.verified && hasTokenReward ? (
            <>
              <LGButton
                className="mt-5"
                label={
                  task.user_token_reward?.status === 'claimed'
                    ? 'Claimed'
                    : task.user_token_reward?.status === 'claiming'
                    ? 'Claiming'
                    : 'Claim'
                }
                actived
                disabled={!task.reward.token_reward?.actual_raffle_time || task.user_token_reward?.status !== 'pending'}
                loading={loading}
                onClick={() => task.user_token_reward && onClaim(task.user_token_reward)}
              />
            </>
          ) : (
            <TaskButtons
              classNames={{ connectBtn: classNames?.connectBtn, verifyBtn: classNames?.verifyBtn }}
              task={task}
              onUpdate={onTaskUpdate}
            />
          )}

          {task.type === QuestType.ConnectWallet && task.verified && (task.properties?.can_reverify_after || 0) > 0 && (
            <ReverifyCountdown task={task} onFinished={onReverifyCDFinished} />
          )}
        </div>

        <div
          className={cn([
            'task-desc-content',
            'absolute z-0 h-full top-0 left-1/2 -translate-x-1/2 w-[25.875rem] overflow-hidden bg-black transition-[max-height] ease-in-out !duration-500',
            isContentVisible ? 'max-h-full' : 'max-h-0 pointer-events-none',
          ])}
        >
          <div className="w-full h-full rounded-[0.625rem] pt-8 px-6 pb-4 bg-[#141414] overflow-y-auto has-scroll-bar">
            <div className="text-sm text-white" dangerouslySetInnerHTML={{ __html: task.description }}></div>
            <div className="text-sm text-[#999] mt-[0.625rem]" dangerouslySetInnerHTML={{ __html: task.tip }}></div>
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

export default Task;
