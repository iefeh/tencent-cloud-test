import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { MintContext } from '..';
import Image from 'next/image';
import nftBorderImg from 'img/nft/mint/nft_border.png';
import { cn } from '@nextui-org/react';
import { MintStatus } from '@/constant/mint';
import MintLoading from './MintLoading';

function Mint() {
  const { mintInfo, status } = useContext(MintContext);

  return (
    <div className="relative">
      <Image className="w-[31.5rem] h-[31.5rem] object-contain" src={nftBorderImg} alt="" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] z-10 flex justify-center items-center overflow-hidden">
        <video
          className={cn([
            'max-w-[calc(100%_+_4em)] h-full -translate-x-8 object-cover',
            status >= MintStatus.MINTED || 'hidden',
          ])}
          preload="auto"
          autoPlay
          muted
          loop
        >
          <source src="/video/NFT.mp4" />
        </video>

        <Image
          className={cn(['object-contain', status >= MintStatus.MINTED && 'hidden'])}
          src={mintInfo.nftImg}
          alt=""
          fill
        />

        <MintLoading />
      </div>
    </div>
  );
}

export default observer(Mint);
