import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import { FC } from 'react';
import EmptyContent from '../common/EmptyContent';

const EndedModal: FC<{ container?: HTMLElement; disclosure: Disclosure }> = ({ container, disclosure }) => {
  return (
    <Modal
      isOpen={disclosure.isOpen}
      onOpenChange={disclosure.onOpenChange}
      hideCloseButton
      portalContainer={container}
      shouldBlockScroll={false}
      isDismissable={false}
      classNames={{
        base: 'max-w-[50rem] h-[25rem] absolute',
        backdrop: 'absolute',
        wrapper: 'absolute',
        body: 'relative pb-4',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <EmptyContent content="This lottery round has ended and rewards are being distributed.<br />The next round is coming soon. Stay tuned!" />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EndedModal;
