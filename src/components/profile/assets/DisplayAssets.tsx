import useSort from '@/hooks/pages/profile/badges/hooks/useSort';
import { NFTItem } from '@/http/services/mint';
import NFT from '@/components/nft/NFT';
import { debounce } from 'lodash';
import { FC } from 'react';

interface Props {
  items: NFTItem[];
}

const DisplayAssets: FC<Props> = ({ items }) => {
  const { containerElRef } = useSort({
    onChange: debounce(async (evt) => {
      const { newIndex, oldIndex } = evt;
      await onSort?.(newIndex!, oldIndex!);
    }, 500),
  });

  async function onSort(newIndex: number, oldIndex: number) {}

  return (
    <ul ref={containerElRef}>
      {items.map((item, index) => (
        <NFT
          name={item.token_metadata?.name}
          src={item.token_metadata?.animation_url}
          status={item.transaction_status}
          key={index}
        />
      ))}
    </ul>
  );
};

export default DisplayAssets;
