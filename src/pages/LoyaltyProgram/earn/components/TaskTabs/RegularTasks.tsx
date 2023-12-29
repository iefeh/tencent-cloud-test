import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import { CircularProgress, Pagination, cn } from '@nextui-org/react';
import PaginationRenderItem from './components/PaginationRenderItem';
import ConnectAndVerify, { VerifyTexts } from '@/pages/components/common/buttons/ConnectAndVerify';
import { TaskListItem, TaskReward, queryTaskListAPI } from '@/http/services/task';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { QuestRewardType, QuestType } from '@/constant/task';
import { connectDiscordAPI, connectSteamAPI, connectTwitterAPI } from '@/http/services/login';
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react';
import closeImg from 'img/loyalty/earn/close.png';

interface TaskItem extends TaskListItem {
  connectTexts?: VerifyTexts;
  showConnectButton?: boolean;
  verifyTexts?: VerifyTexts;
  showVerifyButton?: boolean;
  onConnectClick?: (type: QuestType) => string | undefined | Promise<string | undefined>;
  onVerifyClick?: (item: TaskItem) => undefined;
}

export default function RegularTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [pagiInfo, setPagiInto] = useState({
    total: 0,
    pageIndex: 1,
    pageSize: 9,
  });
  const connectAPIs: { [key: string]: () => Promise<{ authorization_url: string } | undefined> } = {
    [QuestType.ConnectTwitter as string]: connectTwitterAPI,
    [QuestType.ConnectSteam as string]: connectSteamAPI,
    [QuestType.ConnectDiscord as string]: connectDiscordAPI,
  };
  const { open } = useWeb3Modal();
  const { address, chainId, isConnected } = useWeb3ModalAccount();

  async function onBaseConnectClick(type: QuestType) {
    const api = connectAPIs[type];
    if (!api) return '';

    const res = await api();
    if (!res?.authorization_url) throw new Error('Get authorization url failed!');
    return res.authorization_url;
  }

  async function queryTasks() {
    try {
      const { pageIndex, pageSize } = pagiInfo;
      const res = await queryTaskListAPI({ page_num: pageIndex, page_size: pageSize });
      const { quests, total } = res;
      setPagiInto({ ...pagiInfo, total: Math.ceil((+total || 0) / pagiInfo.pageSize) });
      handleQuests(quests);
    } catch (error) {
      console.log(error);
    }
  }

  function handleQuests(list: TaskItem[]) {
    list.forEach((item) => {
      switch (item.type) {
        case QuestType.ConnectTwitter:
        case QuestType.ConnectSteam:
        case QuestType.ConnectDiscord:
          item.onConnectClick = onBaseConnectClick;
          break;
        case QuestType.RetweetTweet:
          item.connectTexts = { label: 'Retweet', loadingLabel: 'Retweet', finishedLabel: 'Retweeted' };
          break;
        case QuestType.JOIN_DISCORD_SERVER:
          item.connectTexts = { label: 'Join', loadingLabel: 'Join', finishedLabel: 'Joined' };
          break;
        case QuestType.FollowOnTwitter:
          item.connectTexts = { label: 'Follow', loadingLabel: 'Follow', finishedLabel: 'Followed' };
          break;
        case QuestType.ASTRARK_PRE_REGISTER:
          item.connectTexts = { label: 'Start', loadingLabel: 'Start', finishedLabel: 'Registered' };
          break;
        case QuestType.ConnectWallet:
          item.achieved = isConnected;
          item.onConnectClick = () => {
            open();
            return '';
          };
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

  function onInit(item: TaskItem) {
    return { connected: !!item.achieved, verified: !!item.verified };
  }

  // useEffect(() => {
  //   const item = tasks.find((i) => i.id === QuestType.ConnectWallet);
  //   if (!item || item.achieved === isConnected) return;

  //   item.achieved = isConnected;
  //   setTasks(structuredClone(tasks));
  // }, [isConnected]);

  useEffect(() => {
    queryTasks();
  }, []);

  const Task = (props: { task: TaskItem }) => {
    const { task } = props;
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
      <div className="task-item col-span-1 overflow-hidden border-1 border-basic-gray rounded-[0.625rem] min-h-[17.5rem] pt-[2.375rem] px-[2.375rem] pb-[2.5rem] flex flex-col hover:border-basic-yellow transition-[border-color] duration-500">
        <div className="text-xl">{task.name}</div>

        <div className="mt-3 flex-1 flex flex-col justify-between relative">
          <div className="text-sm">
            <div className="text-[#999]">{task.description}</div>
            {task.tip && (
              <div className="flex items-center relative">
                <div className="flex-1 text-[#999] overflow-hidden whitespace-nowrap text-ellipsis">{task.tip}</div>
                {needEllipsis && (
                  <div
                    className="text-basic-yellow shrink-0 cursor-pointer leading-6 border-b-1 border-basic-yellow"
                    onClick={showContent}
                  >
                    View More
                  </div>
                )}

                <div ref={shadowTextRef} className="absolute invisible w-max whitespace-nowrap">
                  {task.tip}
                </div>
              </div>
            )}
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
                type={task.type}
                // init={() => onInit(task)}
                connectTexts={task.connectTexts}
                verifyTexts={task.verifyTexts}
                connect={task.onConnectClick}
                verify={task.onVerifyClick}
              />
            </div>
          </div>

          <div
            className={cn([
              'absolute z-0 w-full h-full left-0 top-0 overflow-hidden bg-black transition-[max-height] ease-in-out !duration-500',
              isContentVisible ? 'max-h-full' : 'max-h-0 pointer-events-none',
            ])}
          >
            <div className="w-full h-full rounded-[0.625rem] pt-8 px-6 pb-4 bg-[#141414]">
              <div className="text-sm text-white">{task.description}</div>
              <div className="text-sm text-[#999] mt-[0.625rem]">{task.tip}</div>
            </div>

            <Image
              className="w-3 h-3 absolute right-[0.625rem] top-[0.625rem] cursor-pointer"
              src={closeImg}
              alt=""
              onClick={hideContent}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-7 flex flex-col items-center">
      {tasks.length < 1 ? (
        <CircularProgress aria-label="Loading..." />
      ) : (
        <div className="content grid grid-cols-3 gap-[1.5625rem] font-poppins w-full">
          {tasks.map((task) => (
            <Task key={`${task.id}_${task.achieved}`} task={task} />
          ))}
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
