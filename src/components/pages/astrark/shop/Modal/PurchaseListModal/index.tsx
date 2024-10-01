import {
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
} from '@nextui-org/react';
import { FC, useEffect, useState } from 'react';
import usePurchaseList from './usePurchaseList';
import EmptyContent from '@/components/common/EmptyContent';
import CircularLoading from '@/pages/components/common/CircularLoading';
import PurchaseRecordRow from './PurchaseRecordRow';
import AACirclePagination from '@/components/common/CirclePagination/aa';
import S3Image from '@/components/common/medias/S3Image';

const PurchaseListModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  const { loading, total, data, pagi, setData, onPageChange, queryData } = usePurchaseList();
  const [selectedKeys, setSelectedKeys] = useState(new Set<string>([]));

  useEffect(() => {
    if (isOpen) {
      setData([]);
      queryData(true);
    } else {
      setSelectedKeys(new Set([]));
    }
  }, [isOpen]);

  return (
    <Modal
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "rounded-none bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/bg_modal.png')] bg-no-repeat bg-contain !max-w-full !w-[57.25rem] aspect-[57.25/30] overflow-visible font-fzdb",
        header: '',
        body: 'items-center gap-0',
        closeButton:
          "bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/btn_close.png')] bg-contain bg-no-repeat !bg-transparent w-[6.9375rem] h-[4.75rem] object-contain top-[-1.3rem] right-[-1.625rem] [&>svg]:hidden",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Purchase List</ModalHeader>

            <ModalBody>
              <ul className="w-full flex justify-between h-16 text-lg leading-none text-basic-yellow bg-black/30 px-10 pt-ten gap-4 rounded-base">
                <li className="flex-[240]">Benefits</li>
                <li className="flex-[180]">
                  <p>Price</p>
                  <p className="mt-1 text-sm leading-4 opacity-50">(USDT)</p>
                </li>
                <li className="flex-[224]">
                  <p>QTY</p>
                  <p className="mt-1 text-sm leading-4 opacity-50">(Token)</p>
                </li>
                <li className="flex-[156]">Token</li>
                <li className="flex-[200]">Time</li>
                <li className="w-28 shrink-0">
                  <div className="flex items-center">
                    <div>Status</div>

                    <Popover placement="bottom">
                      <PopoverTrigger>
                        <div>
                          <S3Image className="ml-2 w-4 h-4 object-contain" src="/astrark/shop/icons/notice.png" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="w-[24.25rem] p-7 rounded-base font-poppins text-sm leading-6">
                          <div>
                            <p className="text-basic-yellow">Processing:</p>
                            <p className="mt-1">
                              Transaction is pending confirmation, the item will be delivered once confirmed.
                            </p>
                          </div>

                          <div className="mt-6">
                            <p className="text-[#279831]">Done:</p>
                            <p className="mt-1">Transaction confirmed, item delivery complete.</p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </li>
              </ul>

              <ScrollShadow className="w-full h-[16.5rem] relative mt-2">
                <Listbox
                  items={data}
                  classNames={{ base: 'p-0' }}
                  label="Purchase List"
                  selectionMode="single"
                  selectedKeys={selectedKeys}
                  onSelectionChange={(keys) => setSelectedKeys(keys as any)}
                >
                  {(item) => (
                    <ListboxItem
                      key={`${item.product.name}_${item.request_time}`}
                      className="rounded-none p-0 !bg-transparent"
                      textValue={item.product.name}
                      classNames={{
                        base: 'mt-1 [&[data-selected=true]_.row-record]:border-[#73E8F2]',
                        selectedIcon: 'hidden',
                      }}
                    >
                      <PurchaseRecordRow
                        row={item}
                        actived={selectedKeys.has(`${item.product.name}_${item.request_time}`)}
                      />
                    </ListboxItem>
                  )}
                </Listbox>

                {loading && <CircularLoading noBlur className="bg-transparent" />}

                {data.length < 1 && <EmptyContent className="relative bg-transparent" />}
              </ScrollShadow>

              <AACirclePagination
                page={pagi.current.page_num}
                total={Math.ceil(total / 10)}
                onChange={(index) => onPageChange({ page_num: index })}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PurchaseListModal;
