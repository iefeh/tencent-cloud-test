import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import Link from 'next/link';
import { FC } from 'react';

interface Props {
  disclosure: Disclosure;
}

const MintSuccessModal: FC<Props> = ({ disclosure }) => {
  return (
    <Modal
      backdrop="blur"
      placement="center"
      isOpen={disclosure.isOpen}
      onOpenChange={disclosure.onOpenChange}
      classNames={{
        base: 'max-w-[26.25rem] bg-black border-1 border-basic-gray',
        body: 'flex flex-col items-center px-12 pt-10 pb-[3.75rem] bg-basic-gray',
        closeButton: 'text-white text-base',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <p>
                SBT mint transaction sent successfully, currently confirming on the blockchain. Please note you need to
                wait ahout <span className="text-basic-yellow">5 minutes</span>. Once minted, you can view this SBT on{' '}
                <Link className="text-basic-yellow hover:underline" href="/Profile/MyAssets">
                  My Assets
                </Link>{' '}
                page.
              </p>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MintSuccessModal;
