import { Button, Modal, ModalBody, ModalContent } from '@nextui-org/react';
import type { FC } from 'react';
import StrokeButton from '@/components/common/buttons/StrokeButton';

const ShareModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      classNames={{
        base: 'max-w-[42.5rem] text-brown rounded-none bg-transparent shadow-none',
        body: 'pl-0 pb-0 pt-5 pr-6',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className="bg-[#F7E9CC] border-2 border-basic-gray rounded-base overflow-hidden pt-[3.875rem] pl-[4.5rem] pr-[5.25rem] pb-[3.25rem] font-jcyt6">
                <p>
                  Welcome to Moonveil Mini Games! During each round, you can share content on Twitter to earn three free
                  tickets. Please make sure to follow the required Tweet Template. After sent the post, you can verify
                  to claim your rewards.
                </p>

                <div className="flex justify-center gap-x-[0.375rem] mt-12">
                  <StrokeButton className="w-56" strokeType="brown" strokeText="Share to Twitter" />
                  <StrokeButton className="w-56" strokeType="blue" strokeText="Claim Tickets" />
                </div>
              </div>

              <Button
                className="bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_close.png')] bg-contain bg-no-repeat w-[3.625rem] h-[3.75rem] absolute top-0 right-0 p-0 min-w-0"
                data-text="Play Now"
                onPress={onClose}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ShareModal;
