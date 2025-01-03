import { TaskItem, VerifyTexts } from '@/types/quest';
import { useState } from 'react';
import { MediaType, QuestType } from '@/constant/task';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import useConnect from '@/hooks/useConnect';
import BindTipsModal from '@/components/common/modal/BindTipsModal';
import { prepareEventAPI, verifyEventAPI } from '@/http/services/task';
import { toast } from 'react-toastify';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';

const EventTaskButtons = ({
  campaignId,
  task,
  updateTasks,
}: {
  campaignId: string;
  task: TaskItem;
  updateTasks?: () => void;
}) => {
  const { userInfo, toggleLoginModal, getUserInfo } = useUserContext();
  const { connectTexts, achieved, verified, verify_disabled } = task;
  const [connectLoading, setConnectLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const isNeedConnect = !!task.properties.url;
  const isViewWebsite = task.type === QuestType.ViewWebsite;
  const [verifiable, setVerifiable] = useState(
    !isViewWebsite && !verify_disabled && !verified && (!task.properties.is_prepared || achieved),
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const discordMsgData = useDisclosure();
  const [hasVerifyCD, setHasVerifyCD] = useState(false);
  const isLongCD = [QuestType.TweetInteraction, QuestType.TwitterTopic].includes(task.type);
  const is2048 = task.type === QuestType.Claim2048Ticket;

  const connectType = task.authorization || '';
  const {
    onConnect,
    loading: mediaLoading,
    bindTipsDisclosure,
  } = useConnect(connectType, () => {
    updateTasks?.();
  });

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
      await prepareEventAPI({ task_id: task.id, campaign_id: campaignId });
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
      const res = await verifyEventAPI({ task_id: task.id, campaign_id: campaignId });

      if (!res.verified) {
        if (res.require_authorization) {
          onOpen();
        } else if (res.tip) {
          toast.error(res.tip);
          setHasVerifyCD(true);
        }
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
    } else if (task.type === QuestType.ConnectTelegram || task.authorization === MediaType.TELEGRAM) {
      text = 'Telegram account';
    } else if (task.type === QuestType.ConnectGoogle || task.authorization === MediaType.GOOGLE) {
      text = 'Google account';
    } else if (task.type === QuestType.ConnectApple || task.authorization === MediaType.APPLE) {
      text = 'Apple account';
    } else if (task.type === QuestType.ConnectEmail || task.authorization === MediaType.EMAIL) {
      text = 'Email';
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
        label={verified ? (is2048 ? 'Claimed' : 'Verified') : is2048 ? 'Claim' : 'Verify'}
        loading={verifyLoading || mediaLoading}
        disabled={!userInfo || !verifiable}
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

      <BindTipsModal disclosure={bindTipsDisclosure} />
    </div>
  );
};

export default observer(EventTaskButtons);
