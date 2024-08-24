import { Button, Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/react';
import { useState, type FC } from 'react';
import StrokeButton from '@/components/common/buttons/StrokeButton';
import { useMGDContext } from '@/store/MiniGameDetails';
import { claimShareRewardAPI } from '@/http/services/minigames';
import { toast } from 'react-toastify';
import ConnectNoticeModal from '@/components/common/modal/ConnectNoticeModal';
import { MediaType } from '@/constant/task';
import useConnect from '@/hooks/useConnect';
import { observer } from 'mobx-react-lite';

const ShareModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  const { data, queryDetails } = useMGDContext();
  const { share, share_reward_claimed } = data || {};
  const { onConnect, loading: connectLoading } = useConnect(MediaType.TWITTER, onClaim);
  const [loading, setLoading] = useState(false);
  const disclosure = useDisclosure();

  function onShare() {
    if (!share) return;
    window.open(share);
  }

  async function onClaim() {
    if (!data) return;

    setLoading(true);
    const res = await claimShareRewardAPI({ client_id: data?.client_id });
    if (!!res && !res.verified) {
      toast.error(res.message);
      setLoading(false);

      // 暂只支持twitter验证
      if (res.require_authorization) {
        disclosure.onOpen();
      }

      return;
    }

    toast.success('You have successfully claimed 3 tickets!');
    await queryDetails();
    setLoading(false);
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        classNames={{
          base: 'max-w-[42.5rem] text-brown rounded-none bg-transparent shadow-none',
          body: 'pl-0 pb-0 pt-5 pr-6',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="bg-[#F7E9CC] border-2 border-basic-gray rounded-base overflow-hidden pt-[3.875rem] pl-[4.5rem] pr-[5.25rem] pb-[3.25rem] font-jcyt6">
                  <p>
                    Welcome to Moonveil Mini Games! During each round, you can share content on Twitter to earn three
                    free tickets. Please make sure to follow the required Tweet Template. After sent the post, you can
                    verify to claim your rewards.
                  </p>

                  <div className="flex justify-center gap-x-[0.375rem] mt-12">
                    <StrokeButton
                      className="w-60"
                      strokeType="brown"
                      strokeText="Share for Free Tickets"
                      onPress={onShare}
                    />

                    <StrokeButton
                      className="w-56"
                      strokeType="blue"
                      strokeText={share_reward_claimed ? 'Claimed' : 'Claim Tickets'}
                      isDisabled={!!share_reward_claimed}
                      isLoading={loading || connectLoading}
                      onPress={onClaim}
                    />
                  </div>
                </div>

                <Button
                  className="bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_close.png')] bg-contain bg-no-repeat w-[3.625rem] h-[3.75rem] absolute top-0 right-0 p-0 min-w-0"
                  onPress={onClose}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <ConnectNoticeModal disclosure={disclosure} mediaType={MediaType.TWITTER} onConnect={onConnect} />
    </>
  );
};

export default observer(ShareModal);
