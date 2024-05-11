import { MyNFTQueryParams, NFTItem, updateDisplayNFTListAPI } from '@/http/services/mint';
import NFT from '@/components/nft/NFT';
import { FC, useEffect, useState } from 'react';
import { cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { MAX_DISPLAY_ASSETS } from '@/constant/nft';
import CopyIcon from '@/components/common/IconButton/CopyIcon';
import { formatUserName } from '@/utils/common';
import CirclePagination from '@/components/common/CirclePagination';

interface Props {
  total: number;
  items: (NFTItem | null)[];
  displayItems: Partial<NFTItem>[];
  onUpdate?: () => void;
  onPageChange?: (params: Partial<MyNFTQueryParams>) => void;
}

const Assets: FC<Props & ClassNameProps> = ({ total, items, displayItems, className, onUpdate, onPageChange }) => {
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

  function onPagiChange(index: number) {
    onPageChange?.({ page_num: index });
  }

  useEffect(() => {
    setSelectedNFT(items[0] || null);
  }, [items]);

  return (
    <div className={cn(['flex flex-nowrap', className])}>
      <div className="flex-1">
        <div className="flex flex-wrap flex-1 content-start min-h-[35rem]">
          {items.map((item, index) => {
            const selected = !!item && selectedNFT === item;
            const displayed = displayItems.some((di) => di.token_id === item?.token_id);

            return (
              <div
                key={index}
                className={cn([
                  'w-[11.5625rem] h-[11.5625rem] relative',
                  'shrink-0 flex justify-center items-center',
                  'border-1 border-[#1D1D1D] transition-colors',
                  item && 'hover:border-basic-yellow',
                  selected && 'border-basic-yellow',
                  item ? 'cursor-pointer' : 'cursor-not-allowed',
                ])}
                onClick={() => item && setSelectedNFT(item)}
              >
                <NFT
                  className="w-[8.3125rem] h-[8.3125rem]"
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

        <CirclePagination total={total} className="mt-9 flex justify-center" onChange={onPagiChange} />
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

            <div className="text-sm mt-7 flex justify-between items-center">
              <div>{dayjs(selectedNFT.confirmed_time).format('YYYY-MM-DD HH:mm:ss')}</div>

              <div className="flex items-center bg-gradient-to-r from-basic-yellow/20 via-black/40  to-basic-yellow/20 px-2 py-1 rounded-md">
                <span className="mr-2">{formatUserName(selectedNFT.wallet_addr || '--')}</span>
                <CopyIcon text={selectedNFT.wallet_addr} />
              </div>
            </div>

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
