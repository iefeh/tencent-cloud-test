import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import { Modal, ModalBody, ModalContent, ModalHeader, Tooltip, useDisclosure } from '@nextui-org/react';
import { FC, useEffect, useState } from 'react';
import Reward from '../Reward';
import { claimRewardAPI } from '@/http/services/lottery';
import { toast } from 'react-toastify';
import useShare from '../hooks/useShare';
import useConnect from '@/hooks/useConnect';
import { MediaType } from '@/constant/task';
import ConnectNoticeModal from '@/components/common/modal/ConnectNoticeModal';
import { LotteryRewardType } from '@/constant/lottery';
import CDKClaimedModal from './CDKClaimedModal';
import Link from 'next/link';

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
  onClaimed?: (needClose?: boolean, needWait?: boolean) => void;
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
  const cdkClaimedDisclosure = useDisclosure();
  const shareClaimMBLabel = 'Claim 20 MBs';
  const hasGiftCard = (item?.rewards || []).some((reward) => reward.reward_type === LotteryRewardType.GIFT_CARD);
  const hasCDK = (item?.rewards || []).some((reward) => reward.reward_type === LotteryRewardType.CDK);
  const hasNode = (item?.rewards || []).some((reward) => reward.reward_type === LotteryRewardType.NODE);
  const cdks = (item?.rewards || []).reduce((p, c) => {
    if (c.cdk) p.push(c.cdk);
    return p;
  }, [] as string[]);

  async function onShare() {
    if (hasNode) {
      window.open('https://docs.google.com/forms/d/1Z83IlGz7gsUH9RqREEPRNZr800p5x-hSX-iiaa3Q9T4/edit');
      setHasClaimCD(true);
      return;
    }

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
    if (claimed) {
      if (hasCDK) {
        cdkClaimedDisclosure.onOpen();
        return;
      }
    }

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
    setClaimDisabled(true);
    setShareDisabled(!hasForceShareRewards && !!poolInfo?.first_twitter_topic_verified);
    if (hasCDK) {
      await onClaimed?.(true);
      cdkClaimedDisclosure.onOpen();
      setLoading(false);
      return;
    }
    setLoading(false);
    const needClose =
      !hasNode && (hasShareAndClaimRewards || (!hasForceShareRewards && !!poolInfo?.first_twitter_topic_verified));
    onClaimed?.(needClose);
  }

  function initStatus() {
    if (hasNode) {
      setClaimDisabled(true);
      setShareDisabled(false);
      setShareLabel('Fill out form');
    } else if (!hasForceShareRewards) {
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
      disabled={!hasCDK ? claimed || claimDisabled : false}
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
                {claimed && hasNode ? (
                  <>
                    <div className="text-2xl">Reward Claimed</div>

                    <div className="text-sm mt-6">
                      Congratulations again, please ensure that you have filled out the form to secure your{' '}
                      <span className="text-basic-yellow">Free Node</span> or{' '}
                      <span className="text-basic-yellow">Whitelist</span> spot. And please pay attention to our
                      announcement in Official X account and{' '}
                      <span className="text-basic-yellow">Discord Community Server.</span>
                    </div>

                    <div className="flex items-center gap-x-[5.5rem] mt-5">
                      <LGButton className="w-[18.5rem]" label="Confirm" actived onClick={onClose} />
                    </div>
                  </>
                ) : hasShareAndConfirmRewards && !hasCDK && claimed ? (
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
                      {hasNode ? (
                        <>
                          Please click [Fill out form] to claim your rewards
                          <br />
                          {claimed && (
                            <>
                              View Whitelist history in{' '}
                              <Link
                                className="text-basic-yellow hover:underline"
                                href="/Profile"
                                onClick={(e) => e.stopPropagation()}
                              >
                                User Center
                              </Link>
                            </>
                          )}
                        </>
                      ) : hasGiftCard ? (
                        <>
                          Please contact Moonveil staff and claim your Gift Card.
                          <br />
                          Kindly note this is an IVS limited reward that can only be picked off in person during July 4
                          to July 6 on Moonveil&apos;s booth.
                        </>
                      ) : hasShareAndConfirmRewards ? (
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

      <CDKClaimedModal key={JSON.stringify(cdks)} cdks={cdks} disclosure={cdkClaimedDisclosure} />
    </>
  );
};

export default RewardsModal;
