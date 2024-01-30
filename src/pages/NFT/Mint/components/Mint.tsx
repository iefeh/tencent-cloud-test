import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useRef, useState } from 'react';
import { MintContext } from '..';
import Image from 'next/image';
import nftBorderImg from 'img/nft/mint/nft_border.png';
import MintLoading from './MintLoading';
import Video from '@/pages/components/common/Video';
import { throttle } from 'lodash';
import { NFTItem, queryNFTInfoAPI } from '@/http/services/mint';

function Mint() {
  const { mintInfo, minted, tx_id } = useContext(MintContext);
  const [nftInfo, setNFTInfo] = useState<NFTItem | null>(null);
  const timer = useRef(0);

  const queryNFTInfo = throttle(async () => {
    if (tx_id) {
      try {
        const res = await queryNFTInfoAPI({ tx_id });
        if (res.nft) {
          setNFTInfo(res.nft);
          return;
        }
      } catch (error) {
        setNFTInfo(null);
      }
    }

    timer.current = window.setTimeout(queryNFTInfo, 4000);
  });

  function clearTimer() {
    if (!timer.current) return;

    clearTimeout(timer.current);
    timer.current = 0;
  }

  useEffect(() => {
    if (!minted) {
      clearTimer();
      return;
    }

    queryNFTInfo();
  }, [minted]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div className="relative">
      <Image className="w-[30rem] h-[30rem] object-contain" src={nftBorderImg} alt="" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28.5rem] h-[28.5rem] z-10 flex justify-center items-center overflow-hidden">
        {minted && (
          <Video
            className="w-full h-full object-cover"
            options={{
              sources: [
                {
                  src: (minted && tx_id && nftInfo?.token_metadata?.animation_url) || '/video/nft1.webm',
                  type: 'video/webm',
                },
              ],
            }}
          />
        )}

        {minted || <Image className="object-contain" src={mintInfo.nftImg} alt="" fill />}

        <MintLoading />
      </div>
    </div>
  );
}

export default observer(Mint);
