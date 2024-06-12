import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import { Modal, ModalBody, ModalContent, ModalHeader, Tooltip, useDisclosure } from '@nextui-org/react';
import { FC, useEffect, useState } from 'react';
import Reward from './Reward';
import { claimRewardAPI } from '@/http/services/lottery';
import { toast } from 'react-toastify';
import useShare from './hooks/useShare';
import useConnect from '@/hooks/useConnect';
import { MediaType } from '@/constant/task';
import ConnectNoticeModal from '../common/modal/ConnectNoticeModal';

type DrawDTO = ItemProps<Lottery.RewardResDTO>;

interface Props {
  disclosure: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onOpenChange: () => void;
    isControlled: boolean;
    getButtonProps: (props?: any) => any;
    getDisclosureProps: (props?: any) => any;
  };
  onClaimed?: (needClose?: boolean) => void;
  poolInfo?: Lottery.Pool | null;
}

const RewardsModal: FC<Props & DrawDTO> = ({ disclosure: { isOpen, onOpenChange }, item, poolInfo, onClaimed }) => {
  const hasShareAndConfirmRewards = (item?.rewards || []).some((r) => r.reward_claim_type === 3);
  const hasShareAndClaimRewards = (item?.rewards || []).some((r) => r.reward_claim_type === 2);
  const hasForceShareRewards = hasShareAndConfirmRewards || hasShareAndClaimRewards;
  const claimed = (item?.rewards || []).every((r) => !!r.claimed);
  const [loading, setLoading] = useState(false);
  const [claimDisabled, setClaimDisabled] = useState(false);
  const [shareDisabled, setShareDisabled] = useState(false);
  const [shareLabel, setShareLabel] = useState(hasForceShareRewards ? 'Share To Twitter' : 'Share for 20 MOON BEAMS');
  const { getUrl } = useShare();
  const [shareLoading, setShareLoading] = useState(false);
  const [hasClaimCD, setHasClaimCD] = useState(false);
  const { onConnect, loading: connectLoading } = useConnect(MediaType.TWITTER, onClaim);
  const disclosure = useDisclosure();
  const shareClaimMBLabel = 'Claim 20 MBs';

  async function onShare() {
    if (shareLabel === shareClaimMBLabel) {
      toast.success('Reward Claimed');
      setShareLabel('Claimed 20 MBs');
      setShareDisabled(true);
      onClaimed?.(true);
      return;
    }

    setShareLoading(true);
    const url = await getUrl(poolInfo, item);
    if (!url) {
      setShareLoading(false);
      return;
    }

    window.open(url);

    if (!claimed) {
      if (hasForceShareRewards) {
        setHasClaimCD(true);
      } else {
        setShareLabel(shareClaimMBLabel);
      }
    }

    setShareLoading(false);
  }

  async function onClaim() {
    setLoading(true);

    const data = {
      draw_id: item?.draw_id!,
      lottery_pool_id: item?.lottery_pool_id!,
    };
    const res = await claimRewardAPI(data);
    if (!!res && !res.verified) {
      toast.error(res.message);
      setLoading(false);

      // 暂只支持twitter验证
      if (res.require_authorization) {
        disclosure.onOpen();
      }

      return;
    }

    toast.success('Reward Claimed');
    setLoading(false);
    setClaimDisabled(true);
    setShareDisabled(!hasForceShareRewards && !!poolInfo?.first_twitter_topic_verified);
    const needClose = hasShareAndClaimRewards || (!hasForceShareRewards && !!poolInfo?.first_twitter_topic_verified);
    onClaimed?.(needClose);
  }

  function initStatus() {
    if (!hasForceShareRewards) {
      setClaimDisabled(claimed);
      setShareDisabled(!claimed || !!poolInfo?.first_twitter_topic_verified);
      if (poolInfo?.first_twitter_topic_verified) setShareLabel('Claimed 20 MBs');
    } else {
      setShareDisabled(claimed);
      setClaimDisabled(true);
    }
  }

  useEffect(() => {
    initStatus();
  }, []);

  const claimButton = (
    <LGButton
      className="w-[18.5rem]"
      label={claimed ? 'Claimed Rewards' : 'Claim'}
      actived
      hasCD={hasClaimCD}
      cd={30}
      disabled={claimed || claimDisabled}
      loading={loading || connectLoading}
      onClick={onClaim}
      onCDOver={() => {
        setClaimDisabled(false);
        setHasClaimCD(false);
      }}
    />
  );

  return (
    <>
      <Modal
        backdrop="blur"
        placement="center"
        isOpen={isOpen}
        classNames={{
          base: 'bg-black max-w-[28rem] lg:max-w-[75.4375rem]',
          header: 'p-0',
          closeButton: 'z-10',
          body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] pt-5 pb-8 px-10 max-h-[37.5rem] overflow-y-auto flex flex-col items-center text-center',
        }}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                  <div className="font-semakin text-basic-yellow text-2xl">Rewards</div>
                </div>
              </ModalHeader>

              <ModalBody>
                {hasShareAndConfirmRewards && claimed ? (
                  <>
                    <div className="text-2xl">Reward Claimed</div>

                    <div className="text-sm mt-6">
                      Congratulations again, we will contact you within{' '}
                      <span className="text-basic-yellow">3 business days</span>. If you do not hear from us, please
                      contact us through our <span className="text-basic-yellow">Discord community Ticket</span>.
                    </div>

                    <div className="flex items-center gap-x-[5.5rem] mt-5">
                      <LGButton className="w-[18.5rem]" label="Confirm" actived onClick={onClose} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl">Congratulations on winning the following rewards!</div>

                    <div className="flex items-center mt-[1.875rem] gap-x-16">
                      {(item?.rewards || []).map((reward, index) => (
                        <Reward key={index} item={reward} />
                      ))}
                    </div>

                    <div className="text-sm mt-6">
                      {hasShareAndConfirmRewards ? (
                        <>
                          Please follow these steps to claim your prize:
                          <br />
                          1.Share your reward on Twitter, making sure to tag{' '}
                          <span className="text-basic-yellow">@Moonveil_Studio</span> and include{' '}
                          <span className="text-basic-yellow">#$MORE</span>.
                          <br />
                          After sending the post, please click [<span className="text-basic-yellow">Claim</span>] to
                          verify your post. Please note you will need to wait about 5 minutes before finishing the
                          verification process.
                          <br />
                          2. We will contact you within 3 business days. If you do not receive a message, please contact
                          us through our Discord community Ticket.
                        </>
                      ) : hasShareAndClaimRewards ? (
                        <>
                          Please click [<span className="text-basic-yellow">Share to Twitter</span>] and send a Twitter
                          post to claim your rewards.
                        </>
                      ) : (
                        <>
                          Click to claim rewards now.
                          <br />
                          Bonus: Share to Twitter for an additional{' '}
                          <span className="text-basic-yellow">+20 Moon Beams</span>! (first-time shares only)
                        </>
                      )}
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-x-[5.5rem] gap-y-4 mt-5">
                      {hasForceShareRewards ? (
                        <Tooltip
                          content={
                            <div className="max-w-[25rem] p-4">
                              * Please note that data verification may take a moment. You will need to wait for about 5
                              minutes before the &apos;Claim&apos; button becomes clickable. If you fail the
                              verification process, you can try again after 10 minutes.
                            </div>
                          }
                        >
                          <div>{claimButton}</div>
                        </Tooltip>
                      ) : (
                        claimButton
                      )}

                      <LGButton
                        className="w-[18.5rem]"
                        label={shareLabel}
                        actived
                        disabled={shareDisabled}
                        loading={shareLoading}
                        onClick={onShare}
                      />
                    </div>
                  </>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <ConnectNoticeModal disclosure={disclosure} mediaType={MediaType.TWITTER} onConnect={onConnect} />
    </>
  );
};

export default RewardsModal;
