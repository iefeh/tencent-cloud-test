import Image from 'next/image';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import { FullEventItem, TaskListItem, verifyEventAPI, prepareEventAPI } from '@/http/services/task';
import { useContext, useEffect, useState } from 'react';
import { EventStatus, MediaType, QuestType } from '@/constant/task';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { toast } from 'react-toastify';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import useConnect from '@/hooks/useConnect';
import { useCountdown } from './Countdown';
import dayjs from 'dayjs';
import reverifyTipImg from 'img/loyalty/earn/reverify_tip.png';

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

interface EventTaskProps {
  item?: FullEventItem;
  updateTasks?: () => void;
}

const EVENT_ICON_DICT: Dict<string> = {
  [QuestType.ConnectWallet]: 'wallet_colored',
  [QuestType.ConnectTwitter]: 'twitter_colored',
  [QuestType.ConnectDiscord]: 'discord_colored',
  [QuestType.ConnectTelegram]: 'telegram_colored',
  [QuestType.ConnectSteam]: 'steam_colored',
  [QuestType.FollowOnTwitter]: 'twitter_colored',
  [QuestType.RetweetTweet]: 'twitter_colored',
  [QuestType.LikeTwitter]: 'twitter_colored',
  [QuestType.JOIN_DISCORD_SERVER]: 'discord_colored',
  [QuestType.HoldDiscordRole]: 'discord_colored',
  [QuestType.SEND_DISCORD_MESSAGE]: 'discord_colored',
  [QuestType.HoldNFT]: 'nft_colored',
};

function EventTasks(props: EventTaskProps) {
  const { item, updateTasks } = props;
  const isInProcessing = item?.status === EventStatus.ONGOING;
  const { userInfo, toggleLoginModal, getUserInfo } = useContext(MobxContext);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

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
        case QuestType.CommentTweet:
          item.connectTexts = {
            label: 'Comment',
            finishedLable: 'Commented',
          };
          break;
      }
    });

    setTasks(list);
  }

  useEffect(() => {
    handleQuests(item?.tasks || []);
  }, [item]);

  const TaskButtons = (props: { task: TaskItem }) => {
    const { task } = props;
    const { connectTexts, achieved, verified } = task;
    const [connectLoading, setConnectLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const isNeedConnect = !!task.properties.url;
    const [verifiable, setVerifiable] = useState(!verified && (!task.properties.is_prepared || achieved));
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const discordMsgData = useDisclosure();
    const [hasVerifyCD, setHasVerifyCD] = useState(false);

    const connectType = task.authorization || '';
    const {
      onConnect,
      loading: mediaLoading,
      BindTipsModal,
    } = useConnect(connectType, () => {
      updateTasks?.();
    });

    async function onConnectURL() {
      if (!task.properties?.url) return;
      window.open(task.properties.url, '_blank');
    }

    async function onPrepare() {
      if (!task.properties.is_prepared) return;

      setConnectLoading(true);
      try {
        await prepareEventAPI({ task_id: task.id, campaign_id: item!.id });
        if (updateTasks) await updateTasks();
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
        const res = await verifyEventAPI({ task_id: task.id, campaign_id: item!.id });

        if (!res.verified) {
          if (res.require_authorization) {
            onOpen();
          } else if (res.tip) {
            toast.error(res.tip);
          }

          setHasVerifyCD(true);
        } else {
          if (res.tip) toast.success(res.tip);
          updateTasks?.();
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

      if (task.type === QuestType.ConnectDiscord || task.authorization === MediaType.DISCORD) {
        text = 'Discord account';
      } else if (task.type === QuestType.ConnectTwitter || task.authorization === MediaType.TWITTER) {
        text = 'Twitter account';
      } else if (task.type === QuestType.ConnectSteam || task.authorization === MediaType.STEAM) {
        text = 'Steam account';
      }

      return text;
    }

    return (
      <div className="flex items-center">
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
          label={verified ? 'Verified' : 'Verify'}
          loading={verifyLoading || mediaLoading}
          disabled={!verifiable}
          hasCD={hasVerifyCD}
          cd={30}
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
                        1. Join our official Discord server,{' '}
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

  const TaskCountDown = ({ durationTime }: { durationTime: number }) => {
    const now = Date.now();
    const [leftText, setLeftText] = useState('--:--:--');

    useCountdown(now + durationTime, now, (time) => {
      const du = dayjs.duration(time);
      setLeftText(Math.floor(du.asHours()) + du.format(':mm:ss'));

      if (time <= 0) {
        updateTasks?.();
      }
    });

    return (
      <div className="border-2 border-[#DAAC74] rounded-[0.625rem] bg-[#070707] flex justify-between px-4 py-2">
        <Image className="w-[1.125rem] h-[1.125rem]" src={reverifyTipImg} alt="" />
        <div className="font-poppins text-sm text-[#999] ml-[0.8125rem]">
          Task will start in <span className="text-[#DAAC74]">{leftText}</span>.
        </div>
      </div>
    );
  };

  const Task = (props: { task: TaskItem }) => {
    const { task } = props;
    const { started, started_after } = task;

    return (
      <div className="flex justify-between py-[1.375rem] pl-[1.5625rem] pr-[1.75rem] rounded-[0.625rem] border-1 border-basic-gray hover:border-[#666] bg-basic-gray [&:not(:first-child)]:mt-[0.625rem] transition-colors duration-300 flex-col lg:flex-row items-start lg:items-center">
        <div className="flex items-center">
          <Image
            className="w-9 h-9"
            src={`/img/loyalty/task/${EVENT_ICON_DICT[task.type] || 'default_colored'}.png`}
            alt=""
            width={36}
            height={36}
          />
          <div className="font-poppins-medium text-lg ml-[0.875rem]">{task.description}</div>
        </div>

        {isInProcessing && (
          <div className="w-full lg:w-auto flex justify-end mt-4 lg:mt-0">
            {started ? <TaskButtons task={task} /> : <TaskCountDown durationTime={started_after || 0} />}
          </div>
        )}
      </div>
    );
  };

  const finishedCount = (item?.tasks || []).reduce((p, c) => (p += c.verified ? 1 : 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="font-semakin text-2xl">Tasks</div>

        <div className="font-poppins-medium text-sm text-[#666]">
          ({finishedCount}/{item?.tasks?.length || 0}) Completed
        </div>
      </div>

      {tasks.map((task, index) => (
        <Task key={`${task.id}_${task.achieved}`} task={task} />
      ))}
    </div>
  );
}

export default observer(EventTasks);
