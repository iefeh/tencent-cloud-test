import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import Reward from './Reward';

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

const DrawHistoryModal: FC<Props & ItemProps<Lottery.RewardDTO>> = ({ disclosure: { isOpen, onOpenChange }, item }) => {
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
                <div className="font-semakin text-basic-yellow text-2xl">DRAW HISTORY</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div  className='h-[31.875rem] overflow-hidden'>

              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DrawHistoryModal;
