import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Tooltip,
  cn,
  useDisclosure,
} from '@nextui-org/react';
import PaginationRenderItem from './PaginationRenderItem';
import { TaskListItem, prepareTaskAPI, reverifyTaskAPI, taskDetailsAPI, verifyTaskAPI } from '@/http/services/task';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MediaType, QuestType } from '@/constant/task';
import closeImg from 'img/loyalty/earn/close.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { toast } from 'react-toastify';
import { MobxContext } from '@/pages/_app';
import reverifyTipImg from 'img/loyalty/earn/reverify_tip.png';
import { observer } from 'mobx-react-lite';
import useCountdown from '@/hooks/useCountdown';
import dayjs from 'dayjs';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { debounce } from 'lodash';
import useConnect from '@/hooks/useConnect';
import teamsImg from 'img/loyalty/task/teams.png';
import { TaskCategory, queryTasksAPI } from '@/http/services/battlepass';
import arrowIcon from 'img/loyalty/task/icon_arrow.png';

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

interface Props extends ClassNameProps {
  hideHeader?: boolean;
  categoryItem?: TaskCategory | null;
  onBack?: () => void;
}

function RegularTasksList({ categoryItem, hideHeader, className, onBack }: Props) {
  const { userInfo, toggleLoginModal, getUserInfo } = useContext(MobxContext);
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
      const params = { page_num: pageIndex, page_size: pageSize, category: categoryItem?.id || '' };
      const res = await queryTasksAPI(params);
      const { quests, total } = res;
      Object.assign(pagiInfo.current, pagi);
      setPagiTotal(Math.ceil((+total || 0) / pageSize));
      handleQuests(quests || []);
    } catch (error) {
      console.log(error);
    } finally {
      setTaskListLoading(false);
    }
  }, 500);

  useEffect(() => {
    pagiInfo.current.pageIndex = 1;
    setPagiTotal(0);
    setTasks([]);

    if (!categoryItem) return;

    queryTasks();
  }, [categoryItem]);

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
        case QuestType.Claim2048Ticket:
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
        case QuestType.CommentTweet:
          item.connectTexts = {
            label: 'Comment',
            finishedLable: 'Commented',
          };
          break;
        case QuestType.ViewWebsite:
          item.connectTexts = {
            label: 'Visit',
            finishedLable: 'Visited',
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

  const TaskButtons = (props: { task: TaskItem }) => {
    const { task } = props;
    const { connectTexts, achieved, verified, verify_disabled } = task;
    const [connectLoading, setConnectLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const canReverify = task.type === QuestType.ConnectWallet && (task.properties?.can_reverify_after || 0) === 0;
    const isNeedConnect = !!task.properties.url;
    const [verifiable, setVerifiable] = useState(
      !verify_disabled && (verified ? canReverify : !task.properties.is_prepared || achieved),
    );
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const discordMsgData = useDisclosure();
    const [hasVerifyCD, setHasVerifyCD] = useState(false);
    const isLongCD = [QuestType.TweetInteraction, QuestType.TwitterTopic].includes(task.type);
    const is2048 = task.type === QuestType.Claim2048Ticket;
    const isViewWebsite = task.type === QuestType.ViewWebsite;

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

      if (isViewWebsite) {
        setVerifiable(false);
        setHasVerifyCD(true);
      }
    }

    async function onPrepare() {
      if (!task.properties.is_prepared) return;

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
        if (task.type === QuestType.SEND_DISCORD_MESSAGE) {
          discordMsgData.onOpen();
        } else {
          onConnectURL();
          onPrepare();
        }
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
            setHasVerifyCD(true);
          }
        } else {
          if (res.tip) toast.success(res.tip);
          updateTask();
          getUserInfo();
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
      const { label, finishedLable } = texts || { label: 'Participate', finishedLable: 'Participated' };
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
          label={verified ? (is2048 ? 'Claimed' : canReverify ? 'Reverify' : 'Verified') : is2048 ? 'Claim' : 'Verify'}
          loading={verifyLoading || mediaLoading}
          disabled={!verifiable}
          hasCD={hasVerifyCD}
          tooltip={
            isLongCD && (
              <div className="max-w-[25rem] px-4 py-3">
                * Please note that data verification may take a moment. You will need to wait for about 5 minutes before
                the &apos;Verify&apos; button becomes clickable. If you fail the verification process, you can try again
                after 10 minutes.
              </div>
            )
          }
          cd={isViewWebsite ? 10 : isLongCD ? 180 : 30}
          onClick={onVerify}
          onCDOver={() => {
            setVerifiable(true);
            setHasVerifyCD(false);
          }}
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
                      ? `Your ${getAccountText()} is not connected or the previous authorization has expired. Please click to reconnect.`
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

        <Modal
          placement="center"
          backdrop="blur"
          isOpen={discordMsgData.isOpen}
          onOpenChange={discordMsgData.onOpenChange}
          classNames={{ base: 'bg-[#070707] border-1 border-[#1D1D1D] rounded-[0.625rem] pt-8 pb-4' }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalBody>
                  <p className="font-poppins-medium text-base">
                    Before starting this task, please ensure that you have completed the following steps:
                    <ol className="mt-2">
                      <li>
                        1. Join our official Discord server,
                        <a className="text-basic-yellow underline" href="https://discord.gg/moonveil" target="_blank">
                          Moonveil
                        </a>
                        .
                      </li>
                      <li>
                        2. Get the &quot;<span className="text-basic-yellow">Verified</span>&quot; role.
                      </li>
                    </ol>
                  </p>
                </ModalBody>

                <ModalFooter className="justify-center">
                  <LGButton
                    squared
                    actived
                    label="Confirmed"
                    onClick={() => {
                      onConnectURL();
                      onPrepare();
                      onClose();
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
      <div className="task-item col-span-1 overflow-hidden border-1 border-basic-gray rounded-[0.625rem] min-h-[17.5rem] pt-[2.5rem] px-[2.375rem] pb-[2.5rem] flex flex-col hover:border-basic-yellow transition-[border-color] duration-500 relative">
        <div className="text-xl">{task.name}</div>

        <div className="mt-3 flex-1 flex flex-col justify-between relative">
          <div className="text-sm">
            <Tooltip content={<div className="max-w-[25rem]">{task.description}</div>}>
              <div className="text-[#999] line-clamp-2" dangerouslySetInnerHTML={{ __html: task.description }}></div>
            </Tooltip>

            {task.tip && (
              <div className="flex items-center relative">
                <div
                  className="flex-1 text-[#999] overflow-hidden whitespace-nowrap text-ellipsis  max-h-[1.25rem]"
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
                {task.reward.amount_formatted} Moon Beams
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
            <div className="w-full h-full rounded-[0.625rem] pt-8 px-6 pb-4 bg-[#141414] overflow-y-auto has-scroll-bar">
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

        {task.is_new && (
          <div className="font-semakin text-xl text-transparent bg-clip-text bg-[linear-gradient(270deg,#EDE0B9_0%,#CAA67E_100%)] absolute right-4 top-2 p-2 z-10">
            NEW
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn(['mt-7 mb-[8.75rem] flex flex-col items-center relative', className])}>
      {hideHeader || (
        <div className="self-start mb-8">
          <div className="flex items-center cursor-pointer" onClick={onBack}>
            <Image className="w-[1.625rem] h-[1.375rem]" src={arrowIcon} alt="" width={26} height={22} />

            <span className="ml-3 text-2xl text-[#666666]">BACK</span>
          </div>

          <div className="text-2xl mt-6">{categoryItem?.name || '--'}</div>
        </div>
      )}

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
