import { NFTItem } from '@/http/services/mint';
import NFT from './NFT';
import { FC, useRef, useState } from 'react';
import { useDisclosure } from '@nextui-org/react';
import dayjs from 'dayjs';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import AssetModal from './AssetModal';
import { updateDisplayNFTListAPI } from '@/http/services/astrark';
import CircularLoading from '@/pages/components/common/CircularLoading';
import S3Image from '@/components/common/medias/S3Image';
import { Navigation } from 'swiper/modules';

interface Props {
  loading?: boolean;
  items: (Partial<NFTItem> | null)[];
  onUpdate?: () => void;
}

const DisplayAssets: FC<Props> = ({ loading, items, onUpdate }) => {
  const [currentItem, setCurrentItem] = useState<Partial<NFTItem> | null>(null);
  const disclosure = useDisclosure();
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

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
    <div className="relative mt-[4.375rem] w-[78.25rem] pt-[9.0625rem] px-[8.375rem] max-w-full aspect-[1252/561] bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/assets/bg_display_card.png')] bg-contain bg-no-repeat font-fzdb">
      <Image
        className="absolute top-[-4.375rem] left-1/2 -translate-x-1/2 w-[81.625rem] aspect-[1306/170] z-10"
        src="https://d3dhz6pjw7pz9d.cloudfront.net/astrark/assets/title_display.png"
        alt=""
        width={2612}
        height={340}
        unoptimized
      />

      <Swiper
        modules={[Navigation]}
        slidesPerView="auto"
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide
            key={index}
            className="!w-auto px-8 [&:first-child]:pl-0 [&:last-child]:pr-0 [&+.swiper-slide]:border-l-1 border-[#101F2C] aspect-[232/315]"
          >
            <div className="relative w-[12.5rem] flex flex-col">
              <NFT
                className="w-full h-auto aspect-square"
                name={item ? item.token_metadata?.name || '--' : '　'}
                src={item?.token_metadata?.animation_url || item?.token_metadata?.image}
                isSrcImage={!item?.token_metadata?.animation_url}
                status={item?.transaction_status}
                onClick={() => onItemClick(item)}
              />

              <div className="text-lg leading-none text-basic-yellow absolute left-[0.3125rem] top-[0.125rem] flex-1">
                {item?.type || '　'}
              </div>
            </div>

            <div className="text-base text-[#999999] mt-4">
              {item
                ? item.confirmed_time
                  ? dayjs(item.confirmed_time).format('YYYY-MM-DD') + ' Obtained'
                  : '　'
                : '--'}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        ref={navigationPrevRef}
        className="absolute left-12 top-1/2 -translate-y-1/2 w-[4.375rem] aspect-[70/75] z-0"
      >
        <S3Image src="/astrark/assets/arrow_left.png" fill />
      </div>

      <div
        ref={navigationNextRef}
        className="absolute right-12 top-1/2 -translate-y-1/2 w-[4.375rem] aspect-[70/75] z-0"
      >
        <S3Image src="/astrark/assets/arrow_right.png" fill />
      </div>

      {loading && <CircularLoading noBlur />}

      {currentItem && <AssetModal item={currentItem} disclosure={disclosure} onSwitchDisplay={onSwitchDisplay} />}
    </div>
  );
};

export default DisplayAssets;
