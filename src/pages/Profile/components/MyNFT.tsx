import { Divider } from '@nextui-org/react';
import NFT from '@/pages/components/common/nft/NFT';
import { observer } from 'mobx-react-lite';
import { queryMyNFTListAPI, type NFTItem } from '@/http/services/mint';
import Link from 'next/link';
import useScrollLoad from '@/hooks/useScrollLoad';
import CircularLoading from '@/pages/components/common/CircularLoading';

function MyNFT() {
  const {
    data: nfts,
    scrollRef,
    loading,
    total,
  } = useScrollLoad<NFTItem>({ watchAuth: true, minCount: 5, queryKey: 'nfts', queryFn: queryMyNFTListAPI });

  return (
    <div className="mt-20">
      <div className="flex justify-between items-center">
        <div className="font-semakin text-2xl text-basic-yellow">My NFT（{total}）</div>

        <Link href="/NFT/Merge/history" className="text-basic-yellow">
          Merge History &gt;&gt;
        </Link>
      </div>

      <Divider className="my-[1.875rem]" />

      <div ref={scrollRef} className="w-full max-h-[36.5rem] overflow-hidden relative">
        <div className="flex justify-start items-center flex-wrap gap-[1.25rem]">
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
