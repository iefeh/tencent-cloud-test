import { NFTItem } from '@/http/services/mint';
import NFT from '@/components/nft/NFT';
import { FC } from 'react';

interface Props {
  items: NFTItem[];
}

const Assets: FC<Props> = ({ items }) => {
  return (
    <div>
      {items.map((item, index) => (
        <NFT
          name={item.token_metadata?.name}
          src={item.token_metadata?.animation_url}
          status={item.transaction_status}
          key={index}
        />
      ))}
    </div>
  );
};

export default Assets;
