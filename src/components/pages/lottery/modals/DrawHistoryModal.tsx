import { Lottery } from '@/types/lottery';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import {
  ForwardRefRenderFunction,
  RefObject,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import useBScroll from '@/hooks/useBScroll';
import { type DebouncedFunc, throttle } from 'lodash';
import { queryDrawHistoryAPI } from '@/http/services/lottery';
import dayjs from 'dayjs';
import RewardText from '../RewardText';
import CirclePagination from '@/components/common/CirclePagination';
import CircularLoading from '@/pages/components/common/CircularLoading';
import EmptyContent from '@/components/common/EmptyContent';

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
  ref?: RefObject<DrawHisoryModalRef>;
  onRecordClick?: (item: Lottery.DrawHistoryDTO) => void;
}

export interface DrawHisoryModalRef {
  update: DebouncedFunc<() => Promise<Lottery.DrawHistoryDTO[]>>;
}

const DrawHistoryModal: ForwardRefRenderFunction<DrawHisoryModalRef, Props & ItemProps<Lottery.Pool>> = (
  { disclosure: { isOpen, onOpenChange }, item: poolInfo, onRecordClick },
  ref,
) => {
  const { scrollRef, bsRef } = useBScroll({
    scrollX: false,
    scrollY: true,
    pullUpLoad: true,
    mouseWheel: true,
    click: true,
  });
  const [data, setData] = useState<Lottery.DrawHistoryDTO[]>(Array(20).fill(null));
  const pagi = useRef<PageQueryDto>({ page_num: 1, page_size: 10 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const queryHistory = throttle(async () => {
    setLoading(true);
    const params = { lottery_pool_id: poolInfo?.lottery_pool_id!, ...pagi.current };
    const res = await queryDrawHistoryAPI(params);
    setData(res?.lotteryHistory || []);
    setTotal(Math.ceil((res?.total || 0) / pagi.current.page_size));
    setLoading(false);
    return res?.lotteryHistory || [];
  });

  function onPagiChange(index: number) {
    if (pagi.current.page_num === index) return;
    pagi.current.page_num = index;
    queryHistory();
  }

  useImperativeHandle(ref, () => ({ update: queryHistory }));

  useEffect(() => {
    if (isOpen && poolInfo) {
      queryHistory();
    } else {
      setData([]);
    }

    setTimeout(() => bsRef.current?.refresh(), 0);
  }, [isOpen, poolInfo]);

  return (
    <Modal
      backdrop="blur"
      placement="center"
      isOpen={isOpen}
      classNames={{
        base: 'bg-black max-w-[28rem] lg:max-w-[75.4375rem]',
        header: 'p-0',
        closeButton: 'z-10',
        body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] pt-5 pb-8 px-10 max-h-[37.5rem] overflow-y-auto flex flex-col items-center text-center',
        footer: 'justify-center',
      }}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-2xl">
                  DRAW HISTORY
                  <span className="font-poppins text-base ml-4">
                    You can click on the reward details to claim or view your rewards.
                  </span>
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div ref={scrollRef} className="w-full h-[31.875rem] overflow-hidden relative">
                {data.length > 0 && (
                  <ul>
                    {data.map((item, index) => (
                      <li
                        key={index}
                        className="flex justify-between border-white [&+li]:border-t-1 py-3 pl-6 pr-5 cursor-pointer"
                        onClick={() => onRecordClick?.(item)}
                      >
                        <div className="text-left">
                          <div className="text-lg font-semibold">DRAW {item?.rewards?.length || '--'} TIMES</div>
                          <div className="text-sm text-[#666666]">
                            {item.draw_time ? dayjs(item.draw_time).format('YYYY-MM-DD') : '--'}
                          </div>
                        </div>

                        <div className="text-sm leading-none font-semibold text-right uppercase">
                          {item.rewards.length < 1 ? (
                            <div className="text-[#64523E]">No Prize This Time,Give It Another Shot!</div>
                          ) : (
                            <>
                              {item.rewards.map((reward, ri) => (
                                <RewardText
                                  key={ri}
                                  className="mt-3"
                                  text={reward.reward_name}
                                  quality={reward.reward_level}
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {data.length < 1 && <EmptyContent />}

                {loading && <CircularLoading />}
              </div>
            </ModalBody>

            <ModalFooter>
              {data.length > 0 && (
                <CirclePagination
                  total={total}
                  className="flex justify-center has-scroll-bar"
                  onChange={onPagiChange}
                />
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default forwardRef(DrawHistoryModal);
