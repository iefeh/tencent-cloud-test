import { Fragment } from 'react';
import { cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import TokenRewardProgressCountdown from '@/components/common/task/TokenRewardProgressCountdown';
import { TaskListItem } from '@/http/services/task';
import { TokenRewardDistributeType } from '@/constant/task';

interface Props {
  task: TaskListItem;
  status: number;
}

function TokenRewardProgress({ task, status }: Props) {
  const hasTokenReward = !!task.reward.token_reward;
  const item = task.reward.token_reward;
  const { distribute_type, distribute_mid_state_name } = item || {};
  const isDirectTokenReward = distribute_type === TokenRewardDistributeType.DirectDistribute;
  const progressData = [
    {
      label: 'Questing',
      checked: status >= 0,
    },
    {
      label: 'Claiming',
      checked: status >= 2,
    },
  ];

  if (!isDirectTokenReward || !!distribute_mid_state_name) {
    progressData.splice(1, 0, {
      label: distribute_mid_state_name || 'Raffling',
      checked: status >= 1,
    });
  }

  function getProgressLabel(val = status): string {
    if (val < 0) return '-';

    return progressData[val]?.label || getProgressLabel(val - 1);
  }

  return (
    <>
      {hasTokenReward && (
        <div className="flex justify-between items-center pl-7 pr-24 gap-x-4 mb-12">
          {progressData.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <div
                  className={cn([
                    'w-28 lg:w-[10.5625rem] h-1px bg-current',
                    item.checked ? 'text-brown' : 'text-basic-yellow',
                  ])}
                ></div>
              )}

              <div
                className={cn([
                  'w-2 h-2 rounded-full relative shrink-0 bg-current',
                  item.checked ? 'text-brown' : 'text-basic-yellow',
                ])}
              >
                <div
                  className={cn([
                    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border-1 rounded-full border-current',
                  ])}
                ></div>

                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-max text-sm leading-none capitalize">
                  {item.label}
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      )}

      {hasTokenReward ? (
        isDirectTokenReward ? (
          <TokenRewardProgressCountdown
            taskId={task.id}
            isBrown
            label={getProgressLabel(status)}
            endTime={status < 2 ? task.participant_end_time : task.end_time}
          />
        ) : (
          status !== 1 && (
            <TokenRewardProgressCountdown
              taskId={task.id}
              isBrown
              label={getProgressLabel(status)}
              endTime={status === 0 ? item?.estimated_raffle_time : task.end_time}
            />
          )
        )
      ) : (
        <TokenRewardProgressCountdown
          taskId={task.id}
          isBrown
          label={getProgressLabel(status)}
          endTime={task.end_time}
        />
      )}
    </>
  );
}

export default observer(TokenRewardProgress);
