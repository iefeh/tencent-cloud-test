import { Divider, cn } from '@nextui-org/react';
import NFT from '@/components/nft/NFT';
import { observer } from 'mobx-react-lite';
import { isMobile } from 'react-device-detect';
import Link from 'next/link';
import CircularLoading from '@/pages/components/common/CircularLoading';
import useDisplayAssets from '@/hooks/pages/profile/assets/useDisplayAssets';

function MyNFT() {
  const { loading, data: nfts } = useDisplayAssets();

  return (
    <div className="mt-20">
      <div className="flex justify-between items-center">
        <div className="font-semakin text-2xl text-basic-yellow">My Asset</div>

        <Link href="/Profile/MyAssets" className="text-basic-yellow">
          More Asset &gt;&gt;
        </Link>
      </div>

      <Divider className="my-[1.875rem]" />

      <div className="w-full min-h-[19rem] max-h-[38.5rem] overflow-hidden relative">
        <div className={cn(['flex items-center gap-[1.2rem]', isMobile ? 'w-max' : 'w-full flex-wrap'])}>
          {nfts.map((nft, index) => (
            <NFT
              name={nft?.token_metadata?.name}
              src={nft?.token_metadata?.animation_url}
              status={nft?.transaction_status}
              key={index}
            />
          ))}
        </div>

        {loading && <CircularLoading />}
      </div>
    </div>
  );
}

export default observer(MyNFT);
