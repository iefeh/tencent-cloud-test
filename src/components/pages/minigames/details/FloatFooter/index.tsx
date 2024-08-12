import { useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import type { FC } from 'react';
import ShareModal from './ShareModal';
import StrokeButton from '@/components/common/buttons/StrokeButton';
import TicketModal from './TicketModal';
import TicketCountdown from '../TicketCountdown';
import { createPortal } from 'react-dom';
import { useMGDContext } from '@/store/MiniGameDetails';
import { observer } from 'mobx-react-lite';

const FloatFooter: FC = () => {
  const { data } = useMGDContext();
  const { ticket, ticket_expired_at } = data || {};
  const shareDisclosure = useDisclosure();
  const ticketDisclosure = useDisclosure();

  const content = (
    <div className="fixed z-50 bottom-0 left-0 w-[120rem] h-[8.5rem] pointer-events-none font-jcyt6">
      <Image
        className="object-cover"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_float.png"
        alt=""
        fill
        sizes="100%"
        priority
        unoptimized
      />

      <div className="relative z-0 right-[20.5rem] flex flex-col items-end mt-[0.8125rem] pointer-events-auto w-min ml-auto">
        <TicketCountdown endTime={ticket_expired_at} />

        <div className="flex pr-1 mt-5">
          <StrokeButton
            strokeType="brown"
            strokeText="Share"
            startContent={
              <Image
                className="w-[1.125rem] h-[1.125rem]"
                src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/icons/share_stroke.png"
                alt=""
                width={22}
                height={22}
                unoptimized
              />
            }
            onPress={shareDisclosure.onOpen}
          />

          <StrokeButton className="ml-3" strokeType="yellow" strokeText="Play Now" />

          <StrokeButton className="ml-3" strokeType="blue" strokeText="Buy Tickets" onPress={ticketDisclosure.onOpen} />

          <StrokeButton
            className="w-[9.0625rem] text-yellow-1 p-0 pl-11 pt-[0.875rem] ml-5"
            strokeType="ticket"
            strokeText={(ticket?.remain || 0).toString()}
            startContent={
              <span className="absolute top-0 right-[0.375rem] text-sm leading-none text-white">Your Tickets</span>
            }
          />
        </div>
      </div>

      <ShareModal disclosure={shareDisclosure} />
      <TicketModal item={data} disclosure={ticketDisclosure} />
    </div>
  );

  return createPortal(content, document.body);
};

export default observer(FloatFooter);
