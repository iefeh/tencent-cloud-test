import { NFTItem } from '@/http/services/mint';
import NFT from './NFT';
import { FC, useState } from 'react';
import { cn, useDisclosure } from '@nextui-org/react';
import dayjs from 'dayjs';
import { isMobile } from 'react-device-detect';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import AssetModal from './AssetModal';
import { updateDisplayNFTListAPI } from '@/http/services/astrark';
import CircularLoading from '@/pages/components/common/CircularLoading';

interface Props {
  loading?: boolean;
  items: (Partial<NFTItem> | null)[];
  onUpdate?: () => void;
}

const DisplayAssets: FC<Props> = ({ loading, items, onUpdate }) => {
  const [currentItem, setCurrentItem] = useState<Partial<NFTItem> | null>(null);
  const disclosure = useDisclosure();

  function onItemClick(item: Partial<NFTItem> | null) {
    if (!item) return;
    setCurrentItem(item);
    disclosure.onOpen();
  }

  async function onSwitchDisplay() {
    if (!currentItem) return;

    const { contract_address, chain_id, token_id } = currentItem;
    let isDisplayed = false;
    const nextDisplayItems = items.filter((item) => {
      if (!isDisplayed && item?.transaction_id === currentItem.transaction_id) {
        isDisplayed = true;
        return false;
      }

      return !!item;
    }) as Partial<NFTItem>[];

    if (!isDisplayed) {
      nextDisplayItems.push({
        contract_address,
        chain_id,
        token_id,
        sort: items.length,
      });
    }

    const res = await updateDisplayNFTListAPI(nextDisplayItems);
    if (!res) await onUpdate?.();
  }

  return (
    <div className="relative mt-[4.375rem] overflow-hidden w-[78.25rem] aspect-[1252/561] bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_display_card.png')] bg-contain bg-no-repeat">
      <Image
        className="absolute top-[-4.375rem] left-1/2 -translate-x-1/2 w-[81.625rem] aspect-[1306/170] z-10"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/title_display.png"
        alt=""
        width={2612}
        height={340}
        unoptimized
      />

      <Swiper className="w-[calc(100%_-_16.75rem)] mt-[9.0375rem] !mx-[8.375rem]" slidesPerView="auto">
        {items.map((item, index) => (
          <SwiperSlide
            key={index}
            className="!w-auto px-8 [&:first-child]:pl-0 [&:last-child]:pr-0 [&:not(:first-child)]:border-l-1 border-[#101F2C]"
          >
            <div className="relative w-[12.5rem]">
              <NFT
                className="w-full h-auto aspect-square"
                name={item ? item.token_metadata?.name || '--' : '　'}
                src={item?.token_metadata?.animation_url || item?.token_metadata?.image}
                isSrcImage={!item?.token_metadata?.animation_url}
                status={item?.transaction_status}
                onClick={() => onItemClick(item)}
              />

              <div className="font-semakin text-xs leading-none text-basic-yellow absolute left-[0.3125rem] top-[0.125rem]">
                {item?.type || '　'}
              </div>
            </div>

            <div className="text-xs text-[#999999] mt-4">
              {item
                ? item.confirmed_time
                  ? dayjs(item.confirmed_time).format('YYYY-MM-DD') + ' Obtained'
                  : '　'
                : '--'}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {loading && <CircularLoading />}

      {currentItem && <AssetModal item={currentItem} disclosure={disclosure} onSwitchDisplay={onSwitchDisplay} />}
    </div>
  );
};

export default DisplayAssets;
