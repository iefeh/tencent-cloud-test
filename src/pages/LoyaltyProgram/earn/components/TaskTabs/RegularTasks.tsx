import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { CircularProgress, Pagination } from '@nextui-org/react';
import PaginationRenderItem from './components/PaginationRenderItem';
import ConnectAndVerify, { VerifyTexts } from '@/pages/components/common/buttons/ConnectAndVerify';
import { TaskListItem, TaskReward, queryTaskListAPI } from '@/http/services/task';
import { useEffect, useState } from 'react';
import { QuestRewardType, QuestType } from './index';
import { connectSteamAPI, connectTwitterAPI } from '@/http/services/login';

interface TaskItem extends TaskListItem {
  connectTexts?: VerifyTexts;
  showConnectButton?: boolean;
  verifyTexts?: VerifyTexts;
  showVerifyButton?: boolean;
  onConnectClick?: (item: TaskItem) => void;
  onVerifyClick?: (item: TaskItem) => void;
}

export default function RegularTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [pagiInfo, setPagiInto] = useState({
    total: 0,
    pageIndex: 1,
    pageSize: 9,
  });

  async function queryTasks() {
    try {
      const { pageIndex, pageSize } = pagiInfo;
      const res = await queryTaskListAPI({ page_num: pageIndex, page_size: pageSize });
      const { quests, total } = res;
      setPagiInto({ ...pagiInfo, total: +total || 0 });
      handleQuests(quests);
    } catch (error) {
      console.log(error);
    }
  }

  function handleQuests(list: TaskItem[]) {
    list.forEach((item) => {
      switch (item.id) {
        case QuestType.ConnectTwitter:
          item.onConnectClick = async (item) => {
            const res = await connectTwitterAPI();
          };
          break;
        case QuestType.ConnectSteam:
          item.onConnectClick = (item) => {
            return connectSteamAPI();
          };
          break;
        case QuestType.RetweetTweet:
          item.connectTexts = { label: 'Rwtweet', loadingLabel: 'Retweeting', finishedLabel: 'Retweeted' };
          break;
      }
    });

    setTasks(list);
  }

  function getRewardText(reward: TaskReward) {
    const { amount, type, max_amount, min_amount } = reward || {};
    if (!reward || isNaN(amount)) return '???';

    switch (type) {
      case QuestRewardType.Fixed:
        return `${amount} MBs`;
      case QuestRewardType.Range:
        return max_amount ? `${max_amount} MBs Max` : `${min_amount} MBs Max`;
      default:
        return '???';
    }
  }

  useEffect(() => {
    queryTasks();
  }, []);

  return (
    <div className="mt-7 flex flex-col items-center">
      {tasks.length < 1 ? (
        <CircularProgress aria-label="Loading..." />
      ) : (
        <div className="content grid grid-cols-3 gap-[1.5625rem] font-poppins w-full">
          {tasks.map((task, index) => {
            return (
              <div
                key={index}
                className="task-item col-span-1 overflow-hidden border-1 border-basic-gray rounded-[0.625rem] min-h-[17.5rem] pt-[2.375rem] px-[2.375rem] pb-[2.5rem] flex flex-col justify-between hover:border-basic-yellow transition-[border-color] duration-500"
              >
                <div>
                  <div className="text-xl">{task.name}</div>

                  <div className="text-sm text-[#999]">{task.description}</div>
                  <div className="text-sm text-[#999] overflow-hidden whitespace-nowrap text-ellipsis">{task.tip}</div>
                </div>

                <div className="footer">
                  <div className="flex items-center">
                    <Image className="w-8 h-8" src={mbImg} alt="" />

                    <span className="font-semakin text-base text-basic-yellow ml-[0.4375rem]">
                      {getRewardText(task.reward)}
                    </span>
                  </div>

                  <div className="mt-5">
                    <ConnectAndVerify
                      connectTexts={task.connectTexts}
                      verifyTexts={task.verifyTexts}
                      connect={task.onConnectClick}
                      verify={task.onVerifyClick}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagiInfo.total > 0 && (
        <Pagination
          className="mt-[4.6875rem] mb-[8.75rem]"
          showControls
          total={pagiInfo.total}
          initialPage={1}
          renderItem={PaginationRenderItem}
          classNames={{
            wrapper: 'gap-3',
            item: 'w-12 h-12 font-poppins-medium text-base text-white',
            prev: 'w-12 h-12 border-1 border-white bg-transparent',
            next: 'w-12 h-12 border-1 border-white bg-transparent',
          }}
          disableCursorAnimation
          radius="full"
          variant="light"
        />
      )}
    </div>
  );
}
