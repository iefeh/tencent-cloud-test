import StrokeButton from '@/components/common/buttons/StrokeButton';
import Link from '@/components/link';
import { useMGDContext } from '@/store/MiniGameDetails';
import { Button, Modal, ModalBody, ModalContent, cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import { type FC } from 'react';
import { isMobile } from 'react-device-detect';

interface Props {
  onCompleteTasks?: () => void;
  onRedeemCode?: () => void;
  onBuyTicket?: () => void;
}

const GetTicketModal: FC<DisclosureProps & Props> = ({
  onCompleteTasks,
  onRedeemCode,
  onBuyTicket,
  disclosure: { isOpen, onOpenChange },
}) => {
  const { data } = useMGDContext();
  const { task_category } = data || {};

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        placement="center"
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
                  <p className="text-center text-xl">Welcome to Moonveil Mini Games!</p>

                  <p className="mt-6">Each game requires one ticket. You can obtain tickets in the following ways:</p>

                  <ul>
                    <li>· Free tickets for completing season tasks</li>
                    <li>· Redeem special reward codes</li>
                    <li>· Purchase tickets</li>
                  </ul>

                  <div className="flex flex-col md:flex-row justify-center items-center gap-x-2 gap-y-4 mt-12">
                    <StrokeButton
                      className={cn(['flex-shrink-0', isMobile && 'w-60'])}
                      strokeType="brown"
                      strokeText="Complete Tasks"
                      onClick={onCompleteTasks}
                    />

                    <StrokeButton
                      className={cn(['flex-shrink-0', isMobile && 'w-56'])}
                      strokeType="yellow"
                      strokeText="Redeem Code"
                      onClick={onRedeemCode}
                    />

                    <StrokeButton
                      className={cn(['flex-shrink-0', isMobile && 'w-56'])}
                      strokeType="blue"
                      strokeText="Buy Tickets"
                      onClick={onBuyTicket}
                    />
                  </div>
                </div>

                <Button
                  className="bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_close.png')] bg-contain bg-no-repeat w-[3.625rem] h-[3.75rem] absolute top-0 right-0 p-0 min-w-0"
                  onPress={onClose}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default observer(GetTicketModal);
