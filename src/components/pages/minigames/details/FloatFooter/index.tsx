import { cn, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import type { FC } from 'react';
import ShareModal from './ShareModal';
import StrokeButton from '@/components/common/buttons/StrokeButton';
import TicketModal from './TicketModal';
import TicketCountdown from '../TicketCountdown';
import { createPortal } from 'react-dom';
import { useMGDContext } from '@/store/MiniGameDetails';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { GameStatus } from '@/constant/minigames';
import { isMobile } from 'react-device-detect';
import ShortButton from '@/components/common/buttons/ShortButton';
import S3Image from '@/components/common/medias/S3Image';
import GetTicketModal from './GetTicketModal';
import { useUserContext } from '@/store/User';

interface Props {
  onCompleteTasks?: () => void;
}

const FloatFooter: FC<Props> = ({ onCompleteTasks }) => {
  const { toggleRedeemModal } = useUserContext();
  const { data } = useMGDContext();
  const { ticket, ticket_expired_at, url, share_reward_claimed, status } = data || {};
  const shareDisclosure = useDisclosure();
  const ticketDisclosure = useDisclosure();
  const getTicketDisclosure = useDisclosure();
  const canPlay = status === GameStatus.IN_PROGRESS;
  const SButton = isMobile ? ShortButton : StrokeButton;

  const content = (
    <div
      className={cn([
        'fixed z-50 bottom-0 left-0 pointer-events-none font-jcyt6',
        isMobile ? 'bg-black/50 w-full pb-[0.5625rem]' : 'w-[120rem] h-[8.5rem]',
      ])}
    >
      {isMobile || (
        <Image
          className="object-cover"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_float.png"
          alt=""
          fill
          sizes="100%"
          priority
          unoptimized
        />
      )}

      {isMobile && (
        <S3Image
          className="w-[6.234rem] h-[7.22rem] object-contain absolute right-2 bottom-16"
          src="/minigames/cat.png"
        />
      )}

      <div
        className={cn([
          'relative z-0 flex flex-col mt-[0.8125rem] pointer-events-auto',
          isMobile ? 'items-start pl-3' : 'right-[20.5rem] w-min ml-auto items-end',
        ])}
      >
        <TicketCountdown key={ticket_expired_at} endTime={ticket_expired_at} isSmall />

        <div className={cn(['flex pr-1', isMobile ? 'mt-[0.9375rem]' : 'mt-5'])}>
          <SButton
            strokeType="brown"
            strokeText={share_reward_claimed ? 'Shared' : 'Free Tickets'}
            needAuth
            startContent={
              isMobile || (
                <Image
                  className={cn(['w-[1.125rem] h-[1.125rem]', (!data || !!share_reward_claimed) && 'grayscale'])}
                  src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/icons/share_stroke.png"
                  alt=""
                  width={22}
                  height={22}
                  unoptimized
                />
              )
            }
            isDisabled={!data || !!share_reward_claimed || !canPlay}
            onPress={shareDisclosure.onOpen}
          />

          <Link href={(canPlay && url) || 'javascript:;'} target={canPlay && url ? '_blank' : '_self'}>
            <SButton className="ml-3" strokeType="yellow" strokeText="Play Now" isDisabled={!url || !canPlay} />
          </Link>

          <SButton
            className="ml-3"
            strokeType="blue"
            strokeText="Get Tickets"
            needAuth
            isDisabled={!data || !canPlay}
            onPress={getTicketDisclosure.onOpen}
          />

          <SButton
            className={cn([
              'w-[9.0625rem] text-yellow-1 p-0 ml-5',
              isMobile ? 'text-[1.40625rem]' : 'pl-11 pt-[0.875rem]',
            ])}
            strokeType="ticket"
            strokeText={(ticket?.remain || 0).toString()}
            startContent={
              isMobile ? (
                <>
                  <span className="text-[1.03125rem] leading-none text-brown text-left">
                    Your
                    <br />
                    Tickets
                  </span>
                  <S3Image className="w-[1.78125rem] h-[1.6875rem]" src="/minigames/ticket.png" />
                </>
              ) : (
                <span className="absolute top-0 right-[0.375rem] text-sm leading-none text-white">Your Tickets</span>
              )
            }
          />
        </div>
      </div>

      <GetTicketModal
        disclosure={getTicketDisclosure}
        onCompleteTasks={() => {
          getTicketDisclosure.onClose();
          onCompleteTasks?.();
        }}
        onRedeemCode={() => {
          getTicketDisclosure.onClose();
          toggleRedeemModal(true);
        }}
        onBuyTicket={() => {
          getTicketDisclosure.onClose();
          ticketDisclosure.onOpen();
        }}
      />
      <ShareModal disclosure={shareDisclosure} />
      <TicketModal disclosure={ticketDisclosure} />
    </div>
  );

  return createPortal(content, document.body);
};

export default observer(FloatFooter);
