import { Divider, cn } from '@nextui-org/react';
import NFT from '@/pages/components/common/nft/NFT';
import { observer } from 'mobx-react-lite';
import { queryMyNFTListAPI, type NFTItem } from '@/http/services/mint';
import { isMobile } from 'react-device-detect';
import useScrollLoad from '@/hooks/useScrollLoad';

function MyNFT() {
  const { data: nfts, scrollRef } = useScrollLoad<NFTItem>({
    minCount: 5,
    watchAuth: true,
    bsOptions: isMobile ? { scrollY: false, scrollX: true, scrollbar: true } : {},
    pullupLoad: !isMobile,
    queryKey: 'nfts',
    queryFn: queryMyNFTListAPI,
  });

  return (
    <div className="mt-20">
      <div className="font-semakin text-2xl text-basic-yellow">My NFT</div>

      <Divider className="my-[1.875rem]" />

      <div ref={scrollRef} className="w-full max-h-[38.5rem] overflow-hidden relative">
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
      </div>
    </div>
  );
}

export default observer(MyNFT);
