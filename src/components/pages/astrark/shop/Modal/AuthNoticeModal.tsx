import LGButton from '@/pages/components/common/buttons/LGButton';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { FC } from 'react';

const AuthNoticeModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} classNames={{ header: 'p-0', body: 'py-8' }}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[5.625rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-2xl">Tips</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <p className="text-lg">Unauthorized. Please access the page through the game.</p>

              <div className="w-full flex justify-center items-center gap-x-4 uppercase mt-4">
                <LGButton label="Cancel" onClick={onClose} />

                <LGButton label="Download Game" actived />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AuthNoticeModal;
