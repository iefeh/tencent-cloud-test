import LGButton from '@/pages/components/common/buttons/LGButton';
import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import { FC } from 'react';

const BindTipsModal: FC<{ disclosure: Disclosure }> = ({ disclosure }) => {
  const { isOpen, onOpenChange } = disclosure;

  return (
    <Modal
      placement="center"
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{ base: 'bg-[#141414] rounded-base max-w-[40rem]' }}
    >
      <ModalContent>
        {(onClose) => (
          <ModalBody>
            <div className="flex flex-col" style={{ paddingTop: '3rem', paddingBottom: '2.5rem' }}>
              <p>
                We have detected an account connection conflict. This occurs when an attempt is made to link a platform
                that is already connected to another account.
              </p>
              <br />
              <p>To resolve this, please follow these steps:</p>
              <br />
              <p style={{ textIndent: '1em' }}>
                1. Log in with the platform that is currently linked to the conflicting account.
              </p>
              <p style={{ textIndent: '1em' }}>
                2. Go to [User Center], and disconnect the platform account causing the conflict.
              </p>
              <p style={{ textIndent: '1em' }}>
                3. Wait for 12 hours before attempting to reconnect. This cooldown period helps us maintain platform
                integrity and prevent abusive practices.
              </p>
              <p style={{ textIndent: '1em' }}>4. After 12 hours, log in again and link the account you wish to use.</p>
              <br />
              <p>
                If you encounter any issues, please contact our{' '}
                <a className="text-basic-yellow hover:underline" href="https://discord.gg/moonveil">
                  support team
                </a>{' '}
                for assistance.
              </p>

              <div className="mt-4 flex justify-center">
                <LGButton actived label="Close" onClick={onClose} />
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BindTipsModal;
