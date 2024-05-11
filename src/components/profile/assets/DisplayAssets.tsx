import useSort from '@/hooks/pages/profile/badges/hooks/useSort';
import { NFTItem, queryDisplayNFTListAPI, updateDisplayNFTListAPI } from '@/http/services/mint';
import NFT from '@/components/nft/NFT';
import { debounce } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { Button, cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import CircularLoading from '@/pages/components/common/CircularLoading';

interface Props {
  loading?: boolean;
  items: Partial<NFTItem>[];
  onUpdate?: () => void;
}

const DisplayAssets: FC<Props> = ({ loading, items, onUpdate }) => {
  const [innerLoading, setInnerLoading] = useState(false);
  const { containerElRef } = useSort({
    onChange: debounce(async (evt) => {
      const { newIndex, oldIndex } = evt;
      await onSort?.(newIndex!, oldIndex!);
    }, 500),
  });

  async function onSort(newIndex: number, oldIndex: number) {}

  async function onRemove(index: number) {
    setInnerLoading(true);
    const nextItems = items.slice();
    nextItems.splice(index, 1);
    nextItems.forEach((item, i) => {
      item.sort = i + 1;
    });

    const res = await updateDisplayNFTListAPI(nextItems);
    if (!res) onUpdate?.();

    setInnerLoading(false);
  }

  return (
    <ul ref={containerElRef} className="flex items-center relative z-0 mt-6 bg-black min-h-[18.75rem]">
      {items.map((item, index) => (
        <li
          key={index}
          className={cn([
            'group drag-item',
            'w-60 h-[18.75rem] relative',
            'border-1 border-[#1D1D1D] transition-colors hover:border-basic-yellow',
            'px-[3.375rem] pt-[2.875rem]',
          ])}
        >
          <NFT
            className="w-[8.3125rem] h-[8.3125rem]"
            name={item.token_metadata?.name || '--'}
            src={item.token_metadata?.animation_url}
            status={item.transaction_status}
          />

          <div className="text-xs text-[#999999] mt-4">{dayjs(item.confirmed_time).format('YYYY-MM-DD')} Obtained</div>

          <Button
            className="btn absolute bottom-0 left-0 w-full h-[1.875rem] bg-[#3253C0] hidden group-hover:block"
            radius="none"
            onClick={() => onRemove(index)}
          >
            Remove
          </Button>
        </li>
      ))}

      {(loading || innerLoading) && <CircularLoading />}
    </ul>
  );
};

export default DisplayAssets;
