import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { FC } from 'react';
import BasicButton from '@/pages/components/common/BasicButton';

const NoticeModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  return (
    <Modal
      classNames={{ header: 'p-0', closeButton: 'z-10', body: '26.25rem', footer: '!justify-center mb-4' }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-16 bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-2xl">Attention Here</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <p>
                Please note that you will not be able to disconnect or change wallet address between{' '}
                <span className="font-bold text-basic-yellow">Oct 11 EST and Oct 22 EST</span>.
              </p>
            </ModalBody>

            <ModalFooter>
              <BasicButton label="Confirm" onClick={onClose} />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default NoticeModal;
