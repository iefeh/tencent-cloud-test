import { NFTItem, updateDisplayNFTListAPI } from '@/http/services/mint';
import NFT from '@/components/nft/NFT';
import { FC, useEffect, useState } from 'react';
import { cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { MAX_DISPLAY_ASSETS } from '@/constant/nft';

interface Props {
  items: NFTItem[];
  displayItems: Partial<NFTItem>[];
  onUpdate?: () => void;
}

const Assets: FC<Props & ClassNameProps> = ({ items, displayItems, className, onUpdate }) => {
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [displayLoading, setDisplayLoading] = useState(false);

  async function onDisplayClick() {
    if (!selectedNFT) return;

    setDisplayLoading(true);
    const { contract_address, chain_id, token_id } = selectedNFT;
    const nextDisplayItems = displayItems.slice();
    nextDisplayItems.push({
      contract_address,
      chain_id,
      token_id,
      sort: displayItems.length,
    });

    const res = await updateDisplayNFTListAPI(nextDisplayItems);
    if (!res) onUpdate?.();

    setDisplayLoading(false);
  }

  useEffect(() => {
    setSelectedNFT(items[0] || null);
  }, [items]);

  return (
    <div className={cn(['flex flex-nowrap', className])}>
      <div className="flex flex-wrap flex-1 content-start">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn([
              'w-[11.5625rem] h-[11.5625rem]',
              'shrink-0 flex justify-center items-center',
              'border-1 border-[#1D1D1D] transition-colors hover:border-basic-yellow',
              selectedNFT === item && 'border-basic-yellow',
              'cursor-pointer',
            ])}
            onClick={() => setSelectedNFT(item)}
          >
            <NFT
              className="w-[8.3125rem] h-[8.3125rem]"
              name={item.token_metadata?.name}
              src={item.token_metadata?.animation_url || item.token_metadata?.image}
              isSrcImage={!item.token_metadata?.animation_url}
              status={item.transaction_status}
            />
          </div>
        ))}
      </div>

      {selectedNFT && (
        <div className="shrink-0 w-[28rem]">
          <NFT
            className="w-[28rem] h-[28rem]"
            src={selectedNFT.token_metadata?.animation_url || selectedNFT.token_metadata?.image}
            isSrcImage={!selectedNFT.token_metadata?.animation_url}
            status={selectedNFT.transaction_status}
            hideBorder
          />

          <div className="mt-9 pl-8 pr-10">
            <p className="text-2xl font-semakin">{selectedNFT.token_metadata?.name || '--'}</p>

            <p className="text-sm text-[#999999] mt-6">--</p>

            <div className="text-sm mt-7">{dayjs(selectedNFT.confirmed_time).format('YYYY-MM-DD HH:mm:ss')}</div>

            <div className="mt-12">
              <LGButton
                label="Display"
                actived
                disabled={
                  displayItems.length >= MAX_DISPLAY_ASSETS ||
                  displayItems.some((item) => item.token_id === selectedNFT.token_id)
                }
                loading={displayLoading}
                onClick={onDisplayClick}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
