import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { FC, useState } from 'react';
import Reward from './Reward';
import { claimRewardAPI } from '@/http/services/lottery';
import { toast } from 'react-toastify';

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
  onClaimed?: () => void;
}

const RewardsModal: FC<Props & DrawDTO> = ({ disclosure: { isOpen, onOpenChange }, item, onClaimed }) => {
  const hasShareAndConfirmRewards = (item?.rewards || []).some((r) => r.reward_claim_type === 3);
  const hasShareAndClaimRewards = (item?.rewards || []).some((r) => r.reward_claim_type === 2);
  const [loading, setLoading] = useState(false);

  function onShare() {
    // TODO 跳转twitter链接
  }

  async function onClaim() {
    setLoading(true);

    const data = {
      draw_id: item?.draw_id!,
      lottery_pool_id: item?.lottery_pool_id!,
    };
    const res = await claimRewardAPI(data);
    if (!!res) {
      toast.error(res.message);
      setLoading(false);
      return;
    }

    toast.success('Reward Claimed');
    setLoading(false);
    onClaimed?.();
  }

  return (
    <Modal
      backdrop="blur"
      placement="center"
      isOpen={isOpen}
      classNames={{
        base: 'bg-black max-w-[75.4375rem]',
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
                    1. Stept 1: Share your reward on Twitter, making sure to tag @Moonveil_Studio and include #$MORE.
                    <br />
                    2. We will contact you within 3 business days. If you do not receive a message, please contact us
                    through our Discord community Ticket.
                  </>
                ) : hasShareAndClaimRewards ? (
                  <>
                    Click to claim now.
                    <br />
                    Bonus: Share to Twitter for an additional +20 Moon Beams! (first-time shares only)
                  </>
                ) : (
                  <>Simply share on Twitter to claim your rewards.</>
                )}
              </div>

              <div className="flex items-center gap-x-[5.5rem] mt-5">
                <LGButton className="w-[18.5rem]" label="Claim" actived loading={loading} onClick={onClaim} />

                <LGButton
                  className="w-[18.5rem]"
                  label={
                    hasShareAndConfirmRewards || hasShareAndClaimRewards
                      ? 'Share to Twitter'
                      : 'Share for 20 MOON BEAMS'
                  }
                  actived
                  onClick={onShare}
                />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default RewardsModal;
