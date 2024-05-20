import { Lottery } from '@/types/lottery';
import { Modal, ModalBody, ModalContent, ModalHeader, cn } from '@nextui-org/react';
import { FC, useState } from 'react';
import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';
import { to2Digit } from '@/utils/common';
import { MBsPerDraw } from '@/constant/lottery';
import plusIconImg from 'img/nft/mint/icon_plus.png';
import minusIconImg from 'img/nft/mint/icon_minus.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { throttle } from 'lodash';
import { drawAPI } from '@/http/services/lottery';

interface TicketContentProps extends ItemProps<Lottery.Pool> {
  disabled?: boolean;
  onMinus?: () => void;
  onPlus?: () => void;
}

const FreeTicketContent: FC<TicketContentProps> = ({ item, disabled }) => {
  return (
    <div className="flex justify-between items-center w-full mt-7 font-semakin relative">
      <div className="text-2xl">Default use</div>

      <div className="w-[29.6875rem] h-[5.875rem] relative flex items-center justify-between pl-2 pr-4">
        <Image
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_mb_info.png"
          alt=""
          fill
          sizes="100%"
          unoptimized
        />

        <Image
          className="w-16 h-[5.625rem] object-contain relative z-0"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/ticket_free.png"
          alt=""
          width={3507}
          height={4960}
          unoptimized
        />

        <div className="text-sm relative z-0 flex-1 text-left">FREE TICKETS</div>

        <div className="w-[9.625rem] h-14 relative flex justify-center items-center mr-8 z-0">
          <Image
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_draw_button.png"
            alt=""
            fill
            sizes="100%"
            unoptimized
          />

          <div className="font-semakin text-2xl">{to2Digit(item?.user_free_lottery_ticket_amount)}</div>
        </div>
      </div>

      {disabled && <div className="absolute w-full h-full bg-black/70 z-10"></div>}
    </div>
  );
};

const S1TicketContent: FC<TicketContentProps> = ({ item, disabled, onMinus, onPlus }) => {
  return (
    <div className="flex justify-between items-center w-full mt-7 font-semakin relative">
      <div className="text-2xl">Optional use</div>

      <div className="w-[29.6875rem] h-[5.875rem] relative flex items-center justify-between pl-2 pr-4">
        <Image
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_mb_info.png"
          alt=""
          fill
          sizes="100%"
          unoptimized
        />

        <Image
          className="w-16 h-[5.625rem] object-contain relative z-0"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/ticket_free.png"
          alt=""
          width={3507}
          height={4960}
          unoptimized
        />

        <div className="text-sm relative z-0 flex-1 text-left">S1 TICKETS</div>

        <Image
          className={cn([
            'w-[1.125rem] h-[1.125rem] object-contain mr-3 relative z-0',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          ])}
          src={minusIconImg}
          alt=""
          onClick={onMinus}
        />

        <div className="w-[9.625rem] h-14 relative flex justify-center items-center z-0">
          <Image
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_draw_button.png"
            alt=""
            fill
            sizes="100%"
            unoptimized
          />

          <div className="font-semakin text-2xl">
            {to2Digit(item?.user_s1_lottery_ticket_amount)}/{to2Digit(item?.draw_limits)}
          </div>
        </div>

        <Image
          className={cn([
            'w-[1.125rem] h-[1.125rem] object-contain ml-3 relative z-0',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          ])}
          src={plusIconImg}
          alt=""
          onClick={onPlus}
        />
      </div>
    </div>
  );
};

interface Props {
  disclosure: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onOpenChange: () => void;
    isControlled: boolean;
    getButtonProps: (props?: any) => any;
    getDisclosureProps: (props?: any) => any;
  };
  times: number;
  onDrawed?: (data: Lottery.RewardResDTO) => void;
}

const DrawModal: FC<Props & ItemProps<Lottery.Pool>> = ({
  disclosure: { isOpen, onOpenChange },
  item,
  times,
  onDrawed,
}) => {
  const { userInfo } = useUserContext();
  const isFreeTicketsEnabled = (item?.user_free_lottery_ticket_amount || 0) >= times;
  const isS1TicketsEnabled = (item?.user_s1_lottery_ticket_amount || 0) > 0;
  const [s1TicketsCount, setS1TicketCount] = useState(0);
  const [loading, setLoading] = useState(false);

  let needMbs = 0;
  const totalUsedTickets = s1TicketsCount + (item?.user_free_lottery_ticket_amount || 0);
  if (!isFreeTicketsEnabled) {
    needMbs = Math.max(times - totalUsedTickets, 0) * MBsPerDraw;
  }

  function onMinus() {
    if (!isS1TicketsEnabled) return;
    setS1TicketCount(Math.max(s1TicketsCount - 1, 0));
  }

  function onPlus() {
    if (!isS1TicketsEnabled) return;
    setS1TicketCount(Math.min(s1TicketsCount + 1, item?.draw_limits || 0));
  }

  const onDraw = throttle(async () => {
    setLoading(true);

    const data = {
      lottery_pool_id: item?.lottery_pool_id!,
      draw_count: times,
      lottery_ticket_cost: s1TicketsCount,
      mb_cost: needMbs,
    };

    const res = await drawAPI(data);
    if (!!res.verified) {
      onDrawed?.(res);
    }

    setLoading(false);
  }, 500);

  return (
    <Modal
      backdrop="blur"
      placement="center"
      isOpen={isOpen}
      classNames={{
        base: 'bg-black max-w-[52.6875rem]',
        header: 'p-0',
        closeButton: 'z-10',
        body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] pt-6 pb-[2.875rem] px-[4.625rem] max-h-[37.5rem] overflow-y-auto flex flex-col items-center text-center',
      }}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex justify-between items-center gap-3 pl-8 pr-[5.625rem]">
                <div className="font-semakin text-basic-yellow text-2xl">DRAW {times} TIMES</div>

                <div className="text-[#C89E7A] font-semakin flex-1 text-right">You Own</div>

                <div className="w-[9.625rem] h-14 relative flex items-center">
                  <Image
                    src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_draw_button.png"
                    alt=""
                    fill
                    sizes="100%"
                    unoptimized
                  />

                  <Image className="w-6 h-6 ml-6" src={mbImg} alt="" />

                  <div className="font-semakin text-2xl ml-4">{userInfo?.moon_beam || '--'}</div>
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="text-sm text-[#666666] leading-none">
                Please confirm the tickets and Moon Beams you would like to use for the lottery draw:
              </div>

              {isOpen && <FreeTicketContent item={item} disabled={!isFreeTicketsEnabled} />}

              {isOpen && (
                <S1TicketContent item={item} disabled={!isS1TicketsEnabled} onMinus={onMinus} onPlus={onPlus} />
              )}

              <div className="flex items-center mt-10">
                <Image className="w-[3.25rem] h-[3.25rem]" src={mbImg} alt="" />

                <div className="font-semakin ml-[0.5625rem]">
                  <div className="text-[2rem] text-left">{needMbs}</div>
                  <div className="text-sm leading-none">Moon Beams</div>
                </div>
              </div>

              <div>
                <LGButton
                  className="uppercase w-[18.5rem] h-9 mt-2"
                  label="Confirm"
                  actived
                  disabled={!isFreeTicketsEnabled && !s1TicketsCount && needMbs > (userInfo?.moon_beam || 0)}
                  loading={loading}
                  onClick={onDraw}
                />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default observer(DrawModal);
