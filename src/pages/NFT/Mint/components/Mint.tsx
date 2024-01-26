import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { MintContext } from '..';
import Image from 'next/image';
import nftBorderImg from 'img/nft/mint/nft_border.png';
import { cn } from '@nextui-org/react';
import MintLoading from './MintLoading';
import Video from '@/pages/components/common/Video';

function Mint() {
  const { mintInfo, minted, isEnded } = useContext(MintContext);

  return (
    <div className="relative">
      <Image className="w-[31.5rem] h-[31.5rem] object-contain" src={nftBorderImg} alt="" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] z-10 flex justify-center items-center overflow-hidden">
        <Video
          className={cn(['w-full h-full object-cover', minted || 'hidden'])}
          options={{
            sources: [
              {
                src: '/video/NFT.mp4',
                type: 'video/mp4',
              },
            ],
          }}
        />

        <Image className={cn(['object-contain', minted && 'hidden'])} src={mintInfo.nftImg} alt="" fill />

        <MintLoading />
      </div>
    </div>
  );
}

export default observer(Mint);
