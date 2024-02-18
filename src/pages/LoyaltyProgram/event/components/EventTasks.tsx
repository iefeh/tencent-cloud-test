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

function EventTasks(props: EventTaskProps) {
  const { item, updateTasks } = props;
  const isInProcessing = item?.status === EventStatus.ONGOING;
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
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
        const res = await verifyEventAPI({ task_id: task.id, campaign_id: item!.id });

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
          updateTasks?.();
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
          label={verified ? 'Verified' : 'Verify'}
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

  const Task = (props: { task: TaskItem }) => {
    const { task } = props;

    return (
      <div className="flex justify-between items-center py-[1.375rem] pl-[1.5625rem] pr-[1.75rem] rounded-[0.625rem] border-1 border-basic-gray hover:border-[#666] bg-basic-gray [&:not(:first-child)]:mt-[0.625rem] transition-colors duration-300">
        <div className="flex items-center">
          <Image className="w-9 h-9" src="/img/loyalty/task/discord_colored.png" alt="" width={36} height={36} />
          <div className="font-poppins-medium text-lg ml-[0.875rem]">{task.description}</div>
        </div>

        {isInProcessing && <TaskButtons task={task} />}
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

      {(item?.tasks || []).map((task, index) => (
        <Task key={`${task.id}_${task.achieved}`} task={task} />
      ))}
    </div>
  );
}

export default observer(EventTasks);
