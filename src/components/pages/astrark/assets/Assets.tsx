import type { NFTItem } from '@/http/services/mint';
import { updateDisplayNFTListAPI } from '@/http/services/astrark';
import NFT from '@/components/nft/NFT';
import { FC, RefObject, useEffect, useState } from 'react';
import { cn } from '@nextui-org/react';
import { isMobile } from 'react-device-detect';
import AssetCard from './AssetCard';
import { MAX_DISPLAY_ASSETS } from '@/constant/nft';

interface Props {
  scrollRef: RefObject<HTMLDivElement>;
  items: (NFTItem | null)[];
  displayItems: (Partial<NFTItem> | null)[];
  onUpdate?: () => void;
}

const Assets: FC<Props & ClassNameProps> = ({ scrollRef, items, displayItems, className, onUpdate }) => {
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const validDisplayItems = displayItems.filter((item) => !!item);

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
      <AssetCard
        item={selectedNFT}
        isDisplayed={
          selectedNFT && validDisplayItems.length > 0
            ? validDisplayItems.some((item) => item?.token_id === selectedNFT.token_id)
            : undefined
        }
        disabled={!selectedNFT || validDisplayItems.length >= MAX_DISPLAY_ASSETS}
        onSwitchDisplay={onDisplayClick}
      />

      <div ref={scrollRef} className="flex-1 relative overflow-hidden mt-4">
        <div className={cn(['flex flex-nowrap content-start w-max', isMobile && 'justify-center gap-6'])}>
          {items.map((item, index) => {
            const selected = !!item && selectedNFT === item;
            const displayed = displayItems.some((di) => di && di.token_id === item?.token_id);

            return (
              <div
                key={item?.token_id || index}
                className={cn([
                  'w-[10.375rem] h-[10.375rem]',
                  'relative bg-contain bg-no-repeat',
                  'shrink-0 flex justify-center items-center',
                  item &&
                    "hover:bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/assets/bg_asset_shadow.png')]",
                  selected &&
                    "bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/assets/bg_asset_shadow.png')]",
                  item ? 'cursor-pointer' : 'cursor-not-allowed',
                ])}
                onClick={() => item && setSelectedNFT(item)}
              >
                <NFT
                  className="w-[7.5rem] h-[7.5rem] relative"
                  src={item?.token_metadata?.animation_url || item?.token_metadata?.image}
                  isSrcImage={!item?.token_metadata?.animation_url}
                  status={item?.transaction_status}
                  withControls={false}
                />

                {displayed && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-basic-yellow px-1 border-1 border-basic-yellow/10 rounded-md">
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
