import { Divider } from '@nextui-org/react';
import NFT from '@/pages/components/common/nft/NFT';
import baseNFTImg from 'img/nft/common/nft_base.jpg';
import { useState } from 'react';

export default function MyNFT() {
  const [nfts, setNFTs] = useState([
    {
      title: 'Destiny Tetra : 001',
      cover: baseNFTImg,
    },
    {
      title: 'Destiny Tetra : 001',
      cover: baseNFTImg,
    },
    {
      title: 'Destiny Tetra : 001',
      cover: baseNFTImg,
    },
    null,
    null
  ]);

  return (
    <div className="mt-20">
      <div className="font-semakin text-2xl text-basic-yellow">My NFT</div>

      <Divider className="my-[1.875rem]" />

      <div className="flex justify-between items-center">
        {nfts.map((nft, index) => (
          <NFT src={nft?.cover} key={index} />
        ))}
      </div>
    </div>
  );
}
