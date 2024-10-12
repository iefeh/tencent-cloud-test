import { FC, useState } from 'react';
import type { TaskItem } from '@/types/quest';
import { MediaType, QuestType } from '@/constant/task';
import { cn, useDisclosure } from '@nextui-org/react';
import useConnect from '@/hooks/useConnect';
import {
  type TaskListItem,
  prepareTaskAPI,
  reverifyTaskAPI,
  taskDetailsAPI,
  verifyTaskAPI,
} from '@/http/services/task';
import { useUserContext } from '@/store/User';
import { toast } from 'react-toastify';
import LGButton from '@/pages/components/common/buttons/LGButton';
import BindTipsModal from '@/components/common/modal/BindTipsModal';
import ConnectNoticeModal from '@/components/common/modal/ConnectNoticeModal';
import DiscordMsgModal from '@/components/common/modal/DiscordMsgModal';

interface Props {
  classNames?: {
    connectBtn?: string;
    verifyBtn?: string;
  };
  task: TaskItem;
  onUpdate?: (task: TaskListItem) => void;
}

function getAccountText(task: TaskListItem) {
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

function getConnectLabel(task: TaskItem) {
  const { label, finishedLable } = task.connectTexts || { label: 'Participate', finishedLable: 'Participated' };
  if (task.verified || (task.achieved && !task.properties.is_prepared)) return finishedLable;
  return label;
}

const TaskButtons: FC<Props> = ({ task, onUpdate, classNames }) => {
  const { userInfo, getUserInfo } = useUserContext();
  const { achieved, verified, verify_disabled } = task;
  const [connectLoading, setConnectLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const canReverify = task.type === QuestType.ConnectWallet && (task.properties?.can_reverify_after || 0) === 0;
  const isNeedConnect = !!task.properties.url;
  const isViewWebsite = task.type === QuestType.ViewWebsite;
  const [verifiable, setVerifiable] = useState(
    !isViewWebsite && !verify_disabled && (verified ? canReverify : !task.properties.is_prepared || achieved),
  );
  const connectDisclosure = useDisclosure();
  const discordMsgData = useDisclosure();
  const [hasVerifyCD, setHasVerifyCD] = useState(false);
  const isLongCD = [QuestType.TweetInteraction, QuestType.TwitterTopic].includes(task.type);
  const is2048 = task.type === QuestType.Claim2048Ticket;
  const isExpired = !!task.reward.verify_end_time && Date.now() > task.reward.verify_end_time;
  const isConnectExpired = !!task.participant_end_time && Date.now() > task.participant_end_time;
  const verifyBtnText = verified ? task.button_info?.verified : task.button_info?.verify;

  const connectType = task.type === QuestType.ConnectWallet ? MediaType.METAMASK : task.authorization || '';
  const {
    onConnect,
    loading: mediaLoading,
    bindTipsDisclosure,
  } = useConnect(connectType, () => {
    updateTask();
  });

  async function updateTask() {
    try {
      const res = await taskDetailsAPI({ quest_id: task.id });
      if (!res) return;
      onUpdate?.(res.quest);
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
      connectDisclosure.onOpen();
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
      connectDisclosure.onOpen();
      return;
    }

    setVerifyLoading(true);

    try {
      setVerifiable(false);
      const api = verified ? reverifyTaskAPI : verifyTaskAPI;
      const res = await api({ quest_id: task.id });

      if (!res.verified) {
        if (res.require_authorization) {
          connectDisclosure.onOpen();
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

  return (
    <div className="mt-5 flex items-center">
      {isNeedConnect && !isConnectExpired && (
        <LGButton
          className={cn(['uppercase', classNames?.connectBtn])}
          label={getConnectLabel(task)}
          actived
          loading={connectLoading}
          disabled={achieved || verified || isExpired}
          onClick={onConnectClick}
        />
      )}

      <LGButton
        className={cn(['ml-2 uppercase', classNames?.verifyBtn])}
        label={
          verifyBtnText ||
          (verified ? (is2048 ? 'Claimed' : canReverify ? 'Reverify' : 'Verified') : is2048 ? 'Claim' : 'Verify')
        }
        loading={verifyLoading || mediaLoading}
        disabled={!verifiable || isExpired}
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

      <ConnectNoticeModal mediaText={getAccountText(task)} disclosure={connectDisclosure} onConnect={onConnect} />

      <DiscordMsgModal
        disclosure={discordMsgData}
        onConfirmed={() => {
          onConnectURL();
          onPrepare();
          discordMsgData.onClose();
        }}
      />

      <BindTipsModal disclosure={bindTipsDisclosure} />
    </div>
  );
};

export default TaskButtons;
