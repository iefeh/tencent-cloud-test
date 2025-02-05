import { Lottery } from '@/types/lottery';
import { Modal, ModalBody, ModalContent, ModalHeader, cn } from '@nextui-org/react';
import { FC, useState } from 'react';
import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import { MBsPerDraw } from '@/constant/lottery';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { throttle } from 'lodash';
import { drawAPI, drawReportAPI, queryDrawPermitAPI } from '@/http/services/lottery';
import { toast } from 'react-toastify';
import { TicketContents } from './TicketContent';
import useTransaction from '@/hooks/wallet/useTransaction';
import lotteryABI from '@/http/abi/lottery.json';
import { useUserContext } from '@/store/User';

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
  const [freeTicketsCount, setFreeTicketCount] = useState(0);
  const [s1TicketsCount, setS1TicketCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { userInfo } = useUserContext();

  const ticketsForBuying = Math.max(times - s1TicketsCount - (item?.user_free_lottery_ticket_amount || 0), 0);
  const needMbs = ticketsForBuying * MBsPerDraw;
  const isMBNotEnough = needMbs > (item?.user_mb_amount || 0);
  const { onTransaction } = useTransaction({ abi: lotteryABI, method: 'draw' });

  const onDraw = throttle(async () => {
    if (needMbs > 0 && !isConfirming) {
      setIsConfirming(true);
      return;
    }

    setLoading(true);

    const data = {
      lottery_pool_id: item?.lottery_pool_id!,
      draw_count: times,
      lottery_ticket_cost: s1TicketsCount,
      mb_cost: needMbs,
    };

    let res: any;

    if (item?.chain_id) {
      const permitRes = await queryDrawPermitAPI(data);
      if (!permitRes) {
        setLoading(false);
        return;
      }

      const txRes = await onTransaction({
        config: {
          chainId: permitRes.chain_id,
          contractAddress: permitRes.contract_address,
        },
        params: permitRes.permit,
      });

      if (!txRes) {
        setLoading(false);
        return;
      }

      res = await drawReportAPI({ tx_hash: txRes.hash, chain_id: permitRes.chain_id });
    } else {
      res = await drawAPI(data);
    }

    if (!!res?.verified) {
      toast.success(res.message);
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
        base: 'bg-black max-w-[28rem] lg:max-w-[52.6875rem]',
        header: 'p-0',
        closeButton: 'z-10',
        body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] px-4 py-4 lg:pt-6 lg:pb-[2.875rem] lg:px-[4.625rem] max-h-[37.5rem] overflow-y-auto flex flex-col items-center text-center',
      }}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex justify-between items-center gap-3 px-4 lg:pl-8 lg:pr-[5.625rem]">
                <div className="font-semakin text-basic-yellow text-lg lg:text-2xl">DRAW {times} TIMES</div>

                <div className="text-[#C89E7A] font-semakin flex-1 text-right text-sm">You Own</div>

                <div className="w-[9.625rem] h-14 relative flex items-center">
                  <Image
                    src="https://d3dhz6pjw7pz9d.cloudfront.net/lottery/bg_draw_button.png"
                    alt=""
                    fill
                    sizes="100%"
                    unoptimized
                  />

                  <Image className="w-6 h-6 ml-6" src={mbImg} alt="" />

                  <div className="font-semakin text-2xl ml-4">{item?.user_mb_amount || 0}</div>
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              {isConfirming ? (
                <>
                  <div className="text-sm text-left">
                    You don’t have enough Draw Tickets, please confirm you would like to spend{' '}
                    <span className="text-basic-yellow">{needMbs}</span> Moon Beams to buy{' '}
                    <span className="text-basic-yellow">{ticketsForBuying} </span>
                    ticket(s).
                  </div>

                  <div className="flex items-center mt-10">
                    <Image className="w-[3.25rem] h-[3.25rem]" src={mbImg} alt="" />

                    <div className="font-semakin ml-[0.5625rem]">
                      <div className={cn(['text-[2rem] text-left', isMBNotEnough && 'text-pure-red'])}>{needMbs}</div>
                      <div className="text-sm leading-none">Moon Beams</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-left">
                    Please confirm the tickets you want to use for the draw, each Silver Draw Ticket costs 25 Moon
                    Beams.
                  </div>

                  <TicketContents
                    times={times}
                    poolInfo={item}
                    onFreeTicketChange={setFreeTicketCount}
                    onS1TicketChange={setS1TicketCount}
                  />
                </>
              )}

              <div>
                <LGButton
                  className="uppercase w-[18.5rem] h-9 mt-4"
                  label={isConfirming ? 'Confirm' : 'Draw Now'}
                  actived
                  disabled={!item || (isConfirming ? isMBNotEnough : freeTicketsCount + s1TicketsCount !== times)}
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

export default DrawModal;
