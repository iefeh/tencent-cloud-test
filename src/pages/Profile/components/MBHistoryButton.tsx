import LGButton from '@/pages/components/common/buttons/LGButton';
import {
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  ScrollShadow,
  useDisclosure,
} from '@nextui-org/react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import { MBHistoryRecord, queryMBHistoryListAPI } from '@/http/services/profile';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PaginationRenderItem from '@/pages/LoyaltyProgram/earn/components/TaskTabs/components/PaginationRenderItem';

export default function MBHistoryButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [items, setItems] = useState<MBHistoryRecord[]>([]);
  const pagiInfo = useRef<PagiInfo>({ pageIndex: 1, pageSize: 10 });
  const [pagiTotal, setPagiTotal] = useState(0);

  async function queryItems(pagi = pagiInfo.current) {
    const { pageIndex, pageSize } = pagi;
    const data = { page_num: pageIndex, page_size: pageSize };

    try {
      const res = await queryMBHistoryListAPI(data);
      const { quests, total } = res;
      Object.assign(pagiInfo.current, pagi);
      setPagiTotal(Math.ceil((+total || 0) / pageSize));
      setItems(quests || []);
    } catch (error: any) {
      toast.error(error?.message || error);
      console.log(error);
    }
  }

  function formatTime(time: number) {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
  }

  function onPagiChange(page: number) {
    if (page === pagiInfo.current.pageIndex) return;

    const pagi = { ...pagiInfo.current, pageIndex: page };
    queryItems(pagi);
  }

  useEffect(() => {
    queryItems();
  }, []);

  return (
    <>
      <LGButton label="Moon Beams History >>" actived onClick={onOpen} />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} classNames={{ base: 'bg-[#070707] !rounded-base' }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center h-[6.25rem] bg-[url('/img/profile/bg_lg.png')] bg-contain bg-no-repeat">
                <Image className="w-[2.625rem] h-[2.625rem]" src={mbImg} alt="" />
                <div className="ml-[0.8125rem] font-semakin text-2xl text-basic-yellow">Moon Beams History</div>
              </ModalHeader>

              <ModalBody className="py-9">
                <ScrollShadow className="w-full h-[31.375rem] font-poppins-medium">
                  <Listbox items={items}>
                    {(item) => (
                      <ListboxItem
                        key={`${item.quest_id}_${item.created_time}`}
                        className="mb-item h-[4.75rem] rounded-none border-basic-gray [&+.mb-item]:border-t-1"
                        endContent={
                          <div className="text-xl">
                            {item.moon_beam_delta < 0 ? '-' : '+'}
                            {item.moon_beam_delta} MB
                          </div>
                        }
                      >
                        <div className="flex flex-col justify-between">
                          <div className="text-lg">{item.name || '--'}</div>
                          <div className="text-sm text-[#666]">{formatTime(item.created_time)}</div>
                        </div>
                      </ListboxItem>
                    )}
                  </Listbox>
                </ScrollShadow>

                {items.length > 0 && (
                  <Pagination
                    className="flex justify-center"
                    showControls
                    total={pagiTotal}
                    initialPage={1}
                    renderItem={PaginationRenderItem}
                    classNames={{
                      wrapper: 'gap-3',
                      item: 'w-12 h-12 font-poppins-medium text-base text-white',
                    }}
                    disableCursorAnimation
                    radius="full"
                    variant="light"
                    onChange={onPagiChange}
                  />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
