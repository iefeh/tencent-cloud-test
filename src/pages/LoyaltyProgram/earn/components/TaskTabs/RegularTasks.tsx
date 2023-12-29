import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import { Pagination, cn } from '@nextui-org/react';
import PaginationRenderItem from './components/PaginationRenderItem';
import type { VerifyTexts } from '@/pages/components/common/buttons/ConnectAndVerify';
import { TaskListItem, TaskReward, queryTaskListAPI, verifyTaskAPI } from '@/http/services/task';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { QuestRewardType, QuestType } from '@/constant/task';
import { connectDiscordAPI, connectSteamAPI, connectTwitterAPI } from '@/http/services/login';
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react';
import closeImg from 'img/loyalty/earn/close.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { toast } from 'react-toastify';
import useConnectDialog from '@/hooks/useConnectDialog';
import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import loadingImg from 'img/loyalty/earn/loading.png';
import { MobxContext } from '@/pages/_app';

interface TaskItem extends TaskListItem {
  connectTexts?: VerifyTexts;
  showConnectButton?: boolean;
  verifyTexts?: VerifyTexts;
  showVerifyButton?: boolean;
  onConnectClick?: (type: QuestType) => string | undefined | Promise<string | undefined>;
  onVerifyClick?: (item: TaskItem) => undefined;
}

export default function RegularTasks() {
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskListLoading, setTaskListLoading] = useState(false);
  const [pagiInfo, setPagiInfo] = useState<PagiInfo>({
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

  async function queryTasks(pagi: PagiInfo = pagiInfo) {
    setTaskListLoading(true);

    try {
      const { pageIndex, pageSize } = pagi;
      const res = await queryTaskListAPI({ page_num: pageIndex, page_size: pageSize });
      const { quests, total } = res;
      setPagiInfo({ ...pagi, total: Math.ceil((+total || 0) / pagi.pageSize) });
      handleQuests(quests);
    } catch (error) {
      console.log(error);
    } finally {
      setTaskListLoading(false);
    }
  }

  function handleQuests(list: TaskItem[]) {
    list.forEach((item) => {
      switch (item.type) {
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

  function onPagiChange(page: number) {
    const pagi = { ...pagiInfo, pageIndex: page };
    queryTasks(pagi);
  }

  useEffect(() => {
    queryTasks();
  }, []);

  const TaskButtons = (props: { task: TaskItem }) => {
    const { task } = props;
    const { connectTexts, verifyTexts, achieved } = task;
    const [connected, setConnected] = useState(!!achieved);
    const [verified, setVerified] = useState(!!task.verified);
    const [connectLoading, setConnectLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifiable, setVerifiable] = useState(connected && !verified);
    const dialogWindowRef = useRef<Window | null>(null);

    useConnectDialog(dialogWindowRef, () => {
      const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_CONNECT) || {};
      const { code, msg } = tokens[task.type] || {};
      const isConnected = +code === 1;
      setConnected(isConnected);
      if (isConnected) return;

      delete tokens[task.type];
      localStorage.save(KEY_AUTHORIZATION_CONNECT, tokens);
      toast.error(msg);
    });

    const getButtonLabel = (texts: VerifyTexts, isLoading: boolean, isFinished: boolean) => {
      const { label, loadingLabel, finishedLabel } = texts;
      return isLoading ? loadingLabel : isFinished ? finishedLabel : label;
    };

    function openAuthWindow(authURL: string) {
      const dialog = window.open(
        authURL,
        'Authrization',
        'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
      );
      dialogWindowRef.current = dialog;
      dialog?.addEventListener('close', () => {
        dialogWindowRef.current = null;
      });
    }

    async function onBaseConnectClick() {
      const api = connectAPIs[task.type];
      if (!api) return;

      setConnectLoading(true);

      const res = await api();
      if (!res?.authorization_url) {
        toast.error('Get authorization url failed!');
        setConnectLoading(false);
        return;
      }

      openAuthWindow(res.authorization_url);
      setConnectLoading(false);
    }

    function onConnect() {
      if (task.authorization && !userInfo) {
        toggleLoginModal();
        return;
      }

      switch (task.type) {
        case QuestType.ConnectTwitter:
        case QuestType.ConnectSteam:
        case QuestType.ConnectDiscord:
          onBaseConnectClick();
          break;
        case QuestType.RetweetTweet:
          break;
        case QuestType.JOIN_DISCORD_SERVER:
          break;
        case QuestType.FollowOnTwitter:
          break;
        case QuestType.ASTRARK_PRE_REGISTER:
          break;
        case QuestType.ConnectWallet:
          if (isConnected) {
          } else {
            open();
          }
          break;
      }
    }

    async function onVerify() {
      setVerifyLoading(true);

      try {
        setVerifiable(false);
        const res = await verifyTaskAPI({ quest_id: task.type });
        setVerified(!!res.verified);

        if (!res.verified) {
          setTimeout(() => {
            setVerifiable(true);
          }, 10000);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setVerifyLoading(false);
      }
    }

    return (
      <div className="mt-5 flex items-center">
        <LGButton
          label={getButtonLabel(
            connectTexts || { label: 'Connect', loadingLabel: 'Connecting', finishedLabel: 'Connected' },
            connectLoading,
            connected,
          )}
          actived
          loading={connectLoading}
          disabled={connected || verified}
          onClick={onConnect}
        />

        <LGButton
          className="ml-2"
          label={getButtonLabel(
            verifyTexts || { label: 'Verify', loadingLabel: 'Verifying', finishedLabel: 'Verified' },
            verifyLoading,
            verified,
          )}
          loading={verifyLoading}
          disabled={!connected || verified || !verifiable}
          onClick={onVerify}
        />
      </div>
    );
  };

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

            <TaskButtons task={task} />
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

  const CircularLoading = () => {
    return (
      <div className="relative w-[8.125rem] h-[8.125rem] text-center leading-[8.125rem]" aria-label="Loading...">
        <Image className="overflow-hidden rounded-full animate-spin" src={loadingImg} alt="" fill />
        <span className="relative z-0 font-semakin text-basic-yellow">Loading</span>
      </div>
    );
  };

  return (
    <div className="mt-7 flex flex-col items-center">
      <div
        className={cn([
          'content grid grid-cols-3 gap-[1.5625rem] font-poppins w-full relative',
          tasks.length < 1 && 'h-[37.5rem]',
        ])}
      >
        {tasks.map((task) => (
          <Task key={`${task.id}_${task.achieved}`} task={task} />
        ))}

        {taskListLoading && (
          <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-0">
            <CircularLoading />
          </div>
        )}
      </div>

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
          onChange={onPagiChange}
        />
      )}
    </div>
  );
}
