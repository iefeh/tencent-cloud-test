import { Modal, ModalContent } from '@nextui-org/react';
import { FC } from 'react';

const AppStoreTipsModal: FC<{ disclosure: Disclosure }> = ({ disclosure: { isOpen, onOpenChange } }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>{(onClose) => <></>}</ModalContent>
    </Modal>
  );
};

export default AppStoreTipsModal;
