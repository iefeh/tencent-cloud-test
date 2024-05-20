import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import Image from 'next/image';
import { FC, useState } from 'react';
import Reward from './Reward';
import { throttle } from 'lodash';
import { claimRewardAPI } from '@/http/services/lottery';

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
}

const enum RewardsState {
  NORMAL,
  WAIT_SHARE,
  WAIT_VERIFY,
}

const InitContent: FC<ItemProps<Lottery.DrawResDTO>> = ({ item }) => {
  const [state, setState] = useState<RewardsState>(RewardsState.NORMAL);
  const [loading, setLoading] = useState(false);

  const onClaim = throttle(async () => {
    setLoading(true);

    const data = {
      draw_id: item?.draw_id!,
      lottery_pool_id: item?.lottery_pool_id!,
      reward_id: item?.rewards[0].item_id!,
    };
    const res = await claimRewardAPI(data);
    setLoading(false);

    if (!!res) return;
  }, 500);

  return (
    <>
      <div className="text-2xl">Congratulations on winning the following rewards!</div>

      <div className="flex items-center mt-[1.875rem] gap-x-16">
        {(item?.rewards || []).map((reward, index) => (
          <Reward key={index} item={reward} />
        ))}
      </div>

      <div className="text-sm text-[#666666] mt-[2.125rem]">
        {state === RewardsState.NORMAL ? (
          <>
            Click to claim now.
            <br />
            Bonus: Share to Twitter for an additional +20 Moon Beams! (first-time shares only)
          </>
        ) : state === RewardsState.WAIT_SHARE ? (
          <>
            Please follow these steps to claim your prize:
            <br />
            1. Stept 1: Share your reward on Twitter, making sure to tag @Moonveil_Studio and include #$MORE.
            <br />
            2. We will contact you within 3 business days. If you do not receive a message, please contact us through
            our Discord community Ticket.
          </>
        ) : (
          <>
            Congratulations again, we will contact you within 3 business days.
            <br />
            If you do not receive a message, please contact us through our Discord community Ticket.
          </>
        )}
      </div>

      <div className="flex items-center gap-x-[5.5rem] mt-5">
        {state === RewardsState.NORMAL ? (
          <>
            <LGButton className="w-[18.5rem] uppercase" label="Claim" actived loading={loading} onClick={onClaim} />
            <LGButton
              className="w-[18.5rem] uppercase"
              label="Share for 20 MOON BEAMS"
              actived
              onClick={() => setState(RewardsState.WAIT_SHARE)}
            />
          </>
        ) : state === RewardsState.WAIT_SHARE ? (
          <>
            <LGButton
              className="w-[18.5rem] uppercase"
              label="Share on Twitter"
              actived
              onClick={() => setState(RewardsState.WAIT_VERIFY)}
            />
          </>
        ) : (
          <>
            <LGButton className="w-[18.5rem] uppercase" label="Verify" actived />
          </>
        )}
      </div>
    </>
  );
};

const RewardsModal: FC<Props & ItemProps<Lottery.DrawResDTO>> = ({ disclosure: { isOpen, onOpenChange }, item }) => {
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
              <InitContent item={item} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default RewardsModal;
