import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { FC, useState } from 'react';
import Image from 'next/image';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { throttle } from 'lodash';
import { claimPremiumTicketsAPI } from '@/http/services/lottery';
import { Lottery } from '@/types/lottery';
import { toast } from 'react-toastify';

interface Props {
  onUpdate?: () => void;
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

const S1TicketModal: FC<Props & ItemProps<Lottery.Pool>> = ({
  disclosure: { onOpenChange, isOpen, onClose },
  item,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const onClaim = throttle(async () => {
    if (!item) return;

    setLoading(true);
    const res = await claimPremiumTicketsAPI({ lottery_pool_id: item?.lottery_pool_id });
    setLoading(false);
    if (!res) return;

    toast.success('Congratulations on receiving 3 Silver Lottery Tickets.');
    onClose();
    onUpdate?.();
  }, 500);

  return (
    <Modal
      backdrop="blur"
      placement="center"
      isOpen={isOpen}
      classNames={{
        base: 'bg-black max-w-[36rem]',
        header: 'p-0',
        closeButton: 'z-10',
        body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] pt-12 pb-[2.875rem] px-[4.625rem] max-h-[37.5rem] overflow-y-auto flex flex-col items-center text-center',
      }}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex justify-between items-center gap-3 pl-8 pr-[5.625rem]">
                <div className="font-semakin text-basic-yellow text-2xl text-center">Dear S1 Premium Pass Holder</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="text-sm text-left">
                Welcome to the &quot;More & $MORE Lottery&quot;! Please click to claim your exclusive reward—
                <span className="text-basic-yellow">3 free Silver Lottery Tickets</span> for each pool. Enjoy the
                lottery and good luck!
              </div>

              <div className="flex items-center mt-10">
                <div className="w-32 h-32 relative">
                  <Image
                    className="object-contain"
                    src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/ticket_free.png"
                    alt=""
                    fill
                    sizes="100%"
                    unoptimized
                  />
                </div>

                <div className="font-semakin ml-[0.5625rem]">
                  <div className="text-[2rem] text-left">3</div>
                  <div className="text-sm leading-none uppercase">Silver Tickets</div>
                </div>
              </div>

              <div>
                <LGButton
                  className="uppercase w-[18.5rem] h-9 mt-4"
                  label="Confirm"
                  actived
                  loading={loading}
                  onClick={onClaim}
                />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default S1TicketModal;
