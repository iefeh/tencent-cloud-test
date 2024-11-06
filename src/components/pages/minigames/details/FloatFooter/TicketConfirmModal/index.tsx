import StrokeButton from '@/components/common/buttons/StrokeButton';
import { Button, Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/react';
import { FC, useState } from 'react';
import useBuyTickets from '../TicketModal/useBuyTickets';
import { useMGDContext } from '@/store/MiniGameDetails';
import RulesModal from '../RulesModal';

interface Props {
  ticketAmount: number | string;
}

const TicketConfirmModal: FC<DisclosureProps & Props> = ({
  ticketAmount,
  disclosure: { isOpen, onOpenChange, onClose },
}) => {
  const rulesDisclosure = useDisclosure();
  const { data, queryTickets } = useMGDContext();
  const [buyLoading, setBuyLoading] = useState(false);
  const { onBuyTickets } = useBuyTickets();

  async function onBuyTicketsClick() {
    if (!data) return;

    setBuyLoading(true);
    const res = await onBuyTickets(data, +ticketAmount);
    if (res) {
      await queryTickets();
      onClose();
    }

    setBuyLoading(false);
  }

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
                  <p>
                    Please note that unused tickets within the specified time will automatically become invalid. Once
                    purchased, tickets are <span className="font-bold text-notion">non-refundable</span>. You can find
                    more details in{' '}
                    <span className="text-notion cursor-pointer hover:underline" onClick={rulesDisclosure.onOpen}>
                      Rules
                    </span>
                    .
                  </p>

                  <p className="mt-4">
                    If you agree to the above information, please click [Buy Tickets] to proceed with your purchase.
                  </p>

                  <div className="flex flex-col md:flex-row justify-center items-center gap-x-[0.375rem] gap-y-4 mt-12">
                    <StrokeButton className="w-60" strokeType="brown" strokeText="Cancel" onPress={onClose} />

                    <StrokeButton
                      className="w-56"
                      strokeType="blue"
                      strokeText="Buy Tickets"
                      isLoading={buyLoading}
                      onPress={onBuyTicketsClick}
                    />
                  </div>
                </div>

                <Button
                  className="bg-transparent bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/minigames/icons/icon_close.png')] bg-contain bg-no-repeat w-[3.625rem] h-[3.75rem] absolute top-0 right-0 p-0 min-w-0"
                  onPress={onClose}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <RulesModal disclosure={rulesDisclosure} />
    </>
  );
};

export default TicketConfirmModal;
