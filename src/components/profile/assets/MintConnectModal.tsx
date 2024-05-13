import LGButton from '@/pages/components/common/buttons/LGButton';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { FC } from 'react';

interface Props {
  disclosure: Disclosure;
  onConnect?: () => void;
}

const MintConnectModal: FC<Props> = ({ disclosure, onConnect }) => {
  return (
    <Modal
      placement="center"
      backdrop="blur"
      isOpen={disclosure.isOpen}
      onOpenChange={disclosure.onOpenChange}
      classNames={{ base: 'bg-[#070707] border-1 border-[#1D1D1D] rounded-[0.625rem]' }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="font-poppins text-3xl">Welcome to Moonveil</ModalHeader>
            <ModalBody>
              <p className="font-poppins-medium text-base">
                Your account is not connected or the previous authorization has expired. Please click to reconnect.
              </p>
            </ModalBody>
            <ModalFooter>
              <LGButton squared label="Close" onClick={onClose} />
              <LGButton
                actived
                squared
                label="Connect"
                onClick={() => {
                  onClose();
                  onConnect?.();
                }}
              />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MintConnectModal;
