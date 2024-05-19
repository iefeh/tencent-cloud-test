import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import Image from 'next/image';
import { FC, useEffect, useRef, useState } from 'react';
import Reward from './Reward';
import useBScroll from '@/hooks/useBScroll';
import { throttle } from 'lodash';
import { queryDrawHistoryAPI } from '@/http/services/lottery';

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
}

const DrawHistoryModal: FC<Props & ItemProps<Lottery.Pool>> = ({ disclosure: { isOpen, onOpenChange }, item }) => {
  const { scrollRef, bsRef } = useBScroll({ scrollX: false, scrollY: true, pullUpLoad: true });
  const [data, setData] = useState<Lottery.RewardDTO[]>(Array(20).fill(null));

  const queryHistory = throttle(async () => {
    const params = { lottery_pool_id: item?.lottery_pool_id! };
    const res = await queryDrawHistoryAPI(params);
    setData(res || []);
  });

  useEffect(() => {
    if (isOpen) {
      // queryHistory();
    } else {
      // setData([]);
    }

    setTimeout(() => bsRef.current?.refresh(), 0);
  }, [isOpen]);

  return (
    <Modal
      backdrop="blur"
      placement="center"
      isOpen={isOpen}
      classNames={{
        base: 'bg-black max-w-[75.4375rem]',
        header: 'p-0',
        closeButton: 'z-10',
        body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] pt-5 pb-8 px-10 max-h-[37.5rem] overflow-y-auto flex flex-col items-center text-center',
      }}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-2xl">DRAW HISTORY</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div ref={scrollRef} className="w-full h-[31.875rem] overflow-hidden">
                <ul>
                  {data.map((item, index) => (
                    <li key={index} className="flex justify-between border-white [&+li]:border-t-1 py-3 pl-6 pr-5">
                      <div className="text-left">
                        <div className="text-lg font-semibold">DRAW 3 TIMES</div>
                        <div className="text-sm text-[#666666]">2024-04-04</div>
                      </div>

                      <div className="text-sm leading-none text-[#C2C2C2] text-right">
                        <div className="text-[#64523E]">No Prize This Time,Give It Another Shot!</div>
                        <div className="mt-3">Moon Beams +5</div>
                        <div className="mt-3">Lottery Ticket x1</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DrawHistoryModal;
