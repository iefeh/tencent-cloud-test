import useSort from '@/hooks/pages/profile/badges/hooks/useSort';
import { NFTItem, updateDisplayNFTListAPI } from '@/http/services/mint';
import NFT from '@/components/nft/NFT';
import { debounce } from 'lodash';
import { FC, useState } from 'react';
import { Button, cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { isMobile } from 'react-device-detect';

interface Props {
  loading?: boolean;
  items: (Partial<NFTItem> | null)[];
  onUpdate?: () => void;
}

const DisplayAssets: FC<Props> = ({ loading, items, onUpdate }) => {
  const [innerLoading, setInnerLoading] = useState(false);
  const { containerElRef } = useSort({
    onChange: debounce(async (evt) => {
      setInnerLoading(true);
      const { newIndex, oldIndex } = evt;
      await onSort?.(newIndex!, oldIndex!);
      setInnerLoading(false);
    }, 500),
  });

  async function onSort(newIndex: number, oldIndex: number) {
    let nextItems: Partial<NFTItem>[] = JSON.parse(JSON.stringify(items));
    nextItems = nextItems.filter((item) => !!item);
    let newItem = nextItems[newIndex];
    nextItems[newIndex] = nextItems[oldIndex];
    nextItems[oldIndex] = newItem;
    nextItems.forEach((item, index) => {
      item.sort = index + 1;
    });

    const res = await updateDisplayNFTListAPI(nextItems);
    if (!res) onUpdate?.();
  }

  async function onRemove(index: number) {
    setInnerLoading(true);
    let nextItems: Partial<NFTItem>[] = JSON.parse(JSON.stringify(items));
    nextItems = nextItems.filter((item) => !!item);
    nextItems.splice(index, 1);
    nextItems.forEach((item, i) => {
      item.sort = i + 1;
    });

    const res = await updateDisplayNFTListAPI(nextItems);
    if (!res) onUpdate?.();

    setInnerLoading(false);
  }

  return (
    <ul
      ref={containerElRef}
      className={cn(['flex items-center z-0 mt-6 bg-black min-h-[18.75rem]', , isMobile ? 'w-max' : 'w-min'])}
    >
      {items.map((item, index) => (
        <li
          key={index}
          className={cn([
            item && !isMobile && 'drag-item group',
            !isMobile ? 'w-60 h-[18.75rem] px-[3.375rem] pt-[2.875rem]' : 'px-6 py-8',
            item ? 'hover:border-basic-yellow' : 'cursor-not-allowed',
            'relative border-1 border-[#1D1D1D] transition-colors',
          ])}
        >
          <div className={cn([isMobile ? 'w-32' : 'w-[8.3125rem]', 'relative'])}>
            <NFT
              className="w-full h-auto aspect-square"
              name={item ? item.token_metadata?.name || '--' : '　'}
              src={item?.token_metadata?.animation_url || item?.token_metadata?.image}
              isSrcImage={!item?.token_metadata?.animation_url}
              status={item?.transaction_status}
            />

            <div className="font-semakin text-xs text-basic-yellow absolute -left-1 top-0">{item?.type || '　'}</div>
          </div>

          <div className="text-xs text-[#999999] mt-4">
            {item ? (item.confirmed_time ? dayjs(item.confirmed_time).format('YYYY-MM-DD') + ' Obtained' : '　') : '--'}
          </div>

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
