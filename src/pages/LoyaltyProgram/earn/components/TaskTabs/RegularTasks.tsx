import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  cn,
  useDisclosure,
} from '@nextui-org/react';
import PaginationRenderItem from './components/PaginationRenderItem';
import {
  TaskListItem,
  TaskReward,
  prepareTaskAPI,
  queryTaskListAPI,
  reverifyTaskAPI,
  taskDetailsAPI,
  verifyTaskAPI,
} from '@/http/services/task';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MediaType, QuestRewardType, QuestType } from '@/constant/task';
import closeImg from 'img/loyalty/earn/close.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { toast } from 'react-toastify';
import { MobxContext } from '@/pages/_app';
import reverifyTipImg from 'img/loyalty/earn/reverify_tip.png';
import { observer } from 'mobx-react-lite';
import { useCountdown } from '@/pages/LoyaltyProgram/task/components/Countdown';
import dayjs from 'dayjs';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { debounce } from 'lodash';
import useConnect from '@/hooks/useConnect';

interface VerifyTexts {
  label: string;
  finishedLable: string;
}

interface TaskItem extends TaskListItem {
  connectTexts?: VerifyTexts;
  showConnectButton?: boolean;
  showVerifyButton?: boolean;
  onConnectClick?: (type: QuestType) => string | undefined | Promise<string | undefined>;
  onVerifyClick?: (item: TaskItem) => undefined;
}

function RegularTasks() {
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskListLoading, setTaskListLoading] = useState(false);
  const pagiInfo = useRef<PagiInfo>({
    pageIndex: 1,
    pageSize: 9,
  });
  const [pagiTotal, setPagiTotal] = useState(0);

  const queryTasks = debounce(async function (pagi: PagiInfo = pagiInfo.current, noLoading = false) {
    if (!noLoading) setTaskListLoading(true);

    try {
      const { pageIndex, pageSize } = pagi;
      const res = await queryTaskListAPI({ page_num: pageIndex, page_size: pageSize });
      const { quests, total } = res;
      Object.assign(pagiInfo.current, pagi);
      setPagiTotal(Math.ceil((+total || 0) / pageSize));
      handleQuests(quests);
    } catch (error) {
      console.log(error);
    } finally {
      setTaskListLoading(false);
    }
  }, 500);

  function updateTaskById(id: string, item: TaskListItem) {
    const list = tasks.slice();
    const index = list.findIndex((task) => task.id === id);
    if (index < 0) return;

    list[index] = item;
    handleQuests(list);
  }

  function handleQuests(list: TaskItem[]) {
    list.forEach((item) => {
      switch (item.type) {
        case QuestType.RetweetTweet:
          item.connectTexts = {
            label: 'Repost',
            finishedLable: 'Reposted',
          };
          break;
        case QuestType.JOIN_DISCORD_SERVER:
        case QuestType.HoldDiscordRole:
          item.connectTexts = {
            label: 'Join',
            finishedLable: 'Joined',
          };
          break;
        case QuestType.FollowOnTwitter:
          item.connectTexts = {
            label: 'Follow',
            finishedLable: 'Followed',
          };
          break;
        case QuestType.ASTRARK_PRE_REGISTER:
          item.connectTexts = {
            label: 'Start',
            finishedLable: 'Started',
          };
          break;
      }
    });

    setTasks(list);
  }

  function onPagiChange(page: number) {
    if (page === pagiInfo.current.pageIndex) return;

    const pagi = { ...pagiInfo.current, pageIndex: page };
    queryTasks(pagi);
  }

  // useEffect(() => {
  //   queryTasks();
  // }, []);

  useEffect(() => {
    queryTasks();
  }, [userInfo]);

  const TaskButtons = (props: { task: TaskItem }) => {
    const { task } = props;
    const { connectTexts, achieved, verified } = task;
    const [connectLoading, setConnectLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const canReverify = task.type === QuestType.ConnectWallet && (task.properties?.can_reverify_after || 0) === 0;
    const isNeedConnect = !!task.properties.url;
    const [verifiable, setVerifiable] = useState(verified ? canReverify : !task.properties.is_prepared || achieved);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const connectType = task.type === QuestType.ConnectWallet ? MediaType.METAMASK : task.authorization || '';
    const {
      onConnect,
      loading: mediaLoading,
      BindTipsModal,
    } = useConnect(connectType, () => {
      updateTask();
    });

    async function updateTask() {
      try {
        const res = await taskDetailsAPI({ quest_id: task.id });
        updateTaskById(task.id, res.quest);
      } catch (error) {
        console.log(error);
      }
    }

    async function onConnectURL() {
      if (!task.properties?.url) return;
      window.open(task.properties.url, '_blank');
    }

    async function onPrepare() {
      setConnectLoading(true);
      try {
        await prepareTaskAPI({ quest_id: task.id });
        await updateTask();
      } catch (error) {
        console.log(error);
      } finally {
        setConnectLoading(false);
      }
    }

    function onConnectClick() {
      if (!userInfo) {
        onOpen();
        return;
      }

      if (task.properties.url) {
        onConnectURL();
      }

      if (task.properties.is_prepared) {
        onPrepare();
      }
    }

    async function onVerify() {
      if (task.authorization && !task.user_authorized) {
        onOpen();
        return;
      }

      setVerifyLoading(true);

      try {
        setVerifiable(false);
        const api = verified ? reverifyTaskAPI : verifyTaskAPI;
        const res = await api({ quest_id: task.id });

        if (!res.verified) {
          if (res.require_authorization) {
            onOpen();
          } else if (res.tip) {
            toast.error(res.tip);
          }

          setTimeout(() => {
            setVerifiable(true);
          }, 30000);
        } else {
          if (res.tip) toast.success(res.tip);
          updateTask();
        }
      } catch (error: any) {
        if (error.tip) {
          toast.error(error.tip);
        }
        console.log(error);
      } finally {
        setVerifyLoading(false);
      }
    }

    function getConnectLabel(texts?: VerifyTexts) {
      const { label, finishedLable } = texts || { label: 'Connect', finishedLable: 'Connected' };
      if (task.verified || (task.achieved && !task.properties.is_prepared)) return finishedLable;
      return label;
    }

    function getAccountText() {
      let text = 'account';

      if (task.type === QuestType.ConnectWallet) {
        text = 'crypto address';
      } else if (task.type === QuestType.ConnectDiscord || task.authorization === MediaType.DISCORD) {
        text = 'Discord account';
      } else if (task.type === QuestType.ConnectTwitter || task.authorization === MediaType.TWITTER) {
        text = 'Twitter account';
      } else if (task.type === QuestType.ConnectSteam || task.authorization === MediaType.STEAM) {
        text = 'Steam account';
      }

      return text;
    }

    return (
      <div className="mt-5 flex items-center">
        {isNeedConnect && (
          <LGButton
            className="uppercase"
            label={getConnectLabel(connectTexts)}
            actived
            loading={connectLoading}
            disabled={achieved || verified}
            onClick={onConnectClick}
          />
        )}

        <LGButton
          className="ml-2 uppercase"
          label={verified ? (canReverify ? 'Reverify' : 'Verified') : 'Verify'}
          loading={verifyLoading || mediaLoading}
          disabled={!verifiable}
          onClick={onVerify}
        />

        <Modal
          placement="center"
          backdrop="blur"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          classNames={{ base: 'bg-[#070707] border-1 border-[#1D1D1D] rounded-[0.625rem]' }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="font-poppins text-3xl">Welcome to Moonveil</ModalHeader>
                <ModalBody>
                  <p className="font-poppins-medium text-base">
                    {userInfo
                      ? `It seems you haven't connect your ${getAccountText()}. Please connect it at first.`
                      : "It seems you haven't logged in to the website. Please log in first to access the content."}
                  </p>
                </ModalBody>
                <ModalFooter>
                  <LGButton squared label="Close" onClick={onClose} />
                  <LGButton
                    actived
                    squared
                    label={userInfo ? 'Connect' : 'Login'}
                    onClick={() => {
                      onClose();
                      if (userInfo) {
                        onConnect();
                      } else {
                        console.log('connect click');
                        toggleLoginModal();
                      }
                    }}
                  />
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        <BindTipsModal />
      </div>
    );
  };

  const ReverifyCountdown = (props: { task: TaskItem }) => {
    const {
      task: { properties },
    } = props;
    const { can_reverify_after } = properties || {};
    const [cdText, setCdText] = useState('');

    useCountdown(can_reverify_after || 0, 0, (leftTime) => {
      const du = dayjs.duration(leftTime);
      setCdText(du.format('HH:mm:ss'));

      if (leftTime <= 0) {
        queryTasks();
      }
    });

    return (
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[25.75rem] h-[5.625rem] border-2 border-[#DAAC74] rounded-[0.625rem] bg-[#070707] flex justify-between pt-[1.375rem] pl-[1.0625rem]">
        <Image className="w-[1.125rem] h-[1.125rem]" src={reverifyTipImg} alt="" />
        <div className="font-poppins text-sm text-[#999] ml-[0.8125rem]">
          If your wallet assets have increased, you can reverify your assets in{' '}
          <span className="text-[#DAAC74]">{cdText}</span> to earn more MBs.
        </div>
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
            <div className="text-[#999]" dangerouslySetInnerHTML={{ __html: task.description }}></div>
            {task.tip && (
              <div className="flex items-center relative">
                <div
                  className="flex-1 text-[#999] overflow-hidden whitespace-nowrap text-ellipsis"
                  dangerouslySetInnerHTML={{ __html: task.tip }}
                ></div>
                {needEllipsis && (
                  <div
                    className="text-basic-yellow shrink-0 cursor-pointer leading-6 border-b-1 border-basic-yellow"
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
              <Image className="w-8 h-8" src={mbImg} alt="" />

              <span className="font-semakin text-base text-basic-yellow ml-[0.4375rem]">
                {task.reward.amount_formatted} MBs
              </span>
            </div>

            <TaskButtons task={task} />

            {task.type === QuestType.ConnectWallet &&
              task.verified &&
              (task.properties?.can_reverify_after || 0) > 0 && <ReverifyCountdown task={task} />}
          </div>

          <div
            className={cn([
              'absolute z-0 h-full top-0 left-1/2 -translate-x-1/2 w-[25.875rem] overflow-hidden bg-black transition-[max-height] ease-in-out !duration-500',
              isContentVisible ? 'max-h-full' : 'max-h-0 pointer-events-none',
            ])}
          >
            <div className="w-full h-full rounded-[0.625rem] pt-8 px-6 pb-4 bg-[#141414]">
              <div className="text-sm text-white" dangerouslySetInnerHTML={{ __html: task.description }}></div>
              <div className="text-sm text-[#999] mt-[0.625rem]" dangerouslySetInnerHTML={{ __html: task.tip }}></div>
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
      <div
        className={cn([
          'content flex flex-col lg:grid lg:grid-cols-3 gap-[1.5625rem] font-poppins w-full relative',
          tasks.length < 1 && 'h-[37.5rem]',
        ])}
      >
        {tasks.map((task) => (
          <Task key={`${task.id}_${task.achieved}`} task={task} />
        ))}

        {taskListLoading && <CircularLoading />}
      </div>

      {pagiTotal > 0 && (
        <Pagination
          className="mt-[4.6875rem] mb-[8.75rem]"
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

export default observer(RegularTasks);
