import type { MyNFTQueryParams, NFTItem } from '@/http/services/mint';
import { updateDisplayNFTListAPI } from '@/http/services/astrark';
import NFT from '@/components/nft/NFT';
import { FC, RefObject, useEffect, useState } from 'react';
import { cn } from '@nextui-org/react';
import { isMobile } from 'react-device-detect';
import AssetCard from './AssetCard';

interface Props {
  scrollRef: RefObject<HTMLDivElement>;
  selectedKey: string;
  total: number;
  items: (NFTItem | null)[];
  displayItems: (Partial<NFTItem> | null)[];
  onUpdate?: () => void;
  onPageChange?: (params: Partial<MyNFTQueryParams>) => void;
}

const Assets: FC<Props & ClassNameProps> = ({
  scrollRef,
  selectedKey,
  total,
  items,
  displayItems,
  className,
  onUpdate,
  onPageChange,
}) => {
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);

  async function onDisplayClick() {
    if (!selectedNFT) return;

    const { contract_address, chain_id, token_id } = selectedNFT;
    let isDisplayed = false;
    const nextDisplayItems = displayItems.filter((item) => {
      if (!isDisplayed && item?.transaction_id === selectedNFT.transaction_id) {
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
        sort: displayItems.length,
      });
    }

    const res = await updateDisplayNFTListAPI(nextDisplayItems);
    if (!res) await onUpdate?.();
  }

  useEffect(() => {
    setSelectedNFT(items[0] || null);
  }, [items]);

  return (
    <div className={cn(['flex flex-col flex-nowrap overflow-hidden', isMobile && 'mt-4', className])}>
      {/* <div className="shrink-0 w-[28rem] flex">
        <NFT
          className="w-[23.625rem] h-[23.625rem]"
          src={
            selectedNFT?.token_metadata?.animation_url ||
            selectedNFT?.token_metadata?.image ||
            'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_asset_null.png'
          }
          isSrcImage={!selectedNFT?.token_metadata?.animation_url}
          status={selectedNFT?.transaction_status}
          hideBorder
        />

        <div className="mt-4 pl-[1.375rem] pr-10">
          <p className="text-2xl font-semakin pl-4">{selectedNFT?.token_metadata?.name || '--'}</p>

          <p className="text-sm text-[#999999] mt-6 pl-4">{selectedNFT?.token_metadata?.description || '--'}</p>

          <div className="text-sm mt-7 flex justify-between items-center pl-4">
            <div>
              {selectedNFT?.confirmed_time ? dayjs(selectedNFT?.confirmed_time).format('YYYY-MM-DD HH:mm:ss') : '--'}{' '}
              Obtained
            </div>
          </div>

          <div className="mt-12 flex justify-between items-center gap-x-4">
            <LGButton
              className="!p-0 leading-none bg-transparent !bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_btn_display.png')] rounded-none bg-contain bg-no-repeat w-[12.875rem] h-20 !text-[#5D3C13] !border-none data-[disabled=true]:grayscale"
              label="Display"
              actived
              disabled={
                !selectedNFT ||
                validDisplayItems.length >= MAX_DISPLAY_ASSETS ||
                validDisplayItems.some((item) => item.token_id === selectedNFT?.token_id)
              }
              loading={displayLoading}
              onClick={onDisplayClick}
            />

            <LGButton
              className="!p-0 leading-none bg-transparent !bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_btn_use_now.png')] rounded-none bg-contain bg-no-repeat w-[12.875rem] h-20 border-none !text-white"
              label="Use Now"
              disabled={!selectedNFT?.expolorer_url}
              link={selectedNFT?.expolorer_url}
            />
          </div>
        </div>
      </div> */}
      <AssetCard item={selectedNFT} onSwitchDisplay={onDisplayClick} />

      <div ref={scrollRef} className="flex-1 relative overflow-hidden mt-4">
        <div className={cn(['flex flex-nowrap flex-1 content-start w-max', isMobile && 'justify-center gap-6'])}>
          {items.map((item, index) => {
            const selected = !!item && selectedNFT === item;
            const displayed = displayItems.some((di) => di && di.token_id === item?.token_id);

            return (
              <div
                key={index}
                className={cn([
                  'w-[10.375rem] h-[10.375rem]',
                  'relative bg-contain bg-no-repeat',
                  'shrink-0 flex justify-center items-center',
                  item &&
                    "hover:bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_asset_shadow.png')]",
                  selected &&
                    "bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_asset_shadow.png')]",
                  item ? 'cursor-pointer' : 'cursor-not-allowed',
                ])}
                onClick={() => item && setSelectedNFT(item)}
              >
                <NFT
                  className="w-[7.5rem] h-[7.5rem]"
                  src={item?.token_metadata?.animation_url || item?.token_metadata?.image}
                  isSrcImage={!item?.token_metadata?.animation_url}
                  status={item?.transaction_status}
                />

                {displayed && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-basic-yellow font-semakin px-1 border-1 border-basic-yellow/10 rounded-md">
                    Displayed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Assets;
