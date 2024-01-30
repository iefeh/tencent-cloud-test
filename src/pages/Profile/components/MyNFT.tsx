import { Divider } from '@nextui-org/react';
import NFT from '@/pages/components/common/nft/NFT';
import { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { MobxContext } from '@/pages/_app';
import { throttle } from 'lodash';
import { NFTItem, queryMyNFTListAPI } from '@/http/services/mint';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';

function getBasePageInfo() {
  return { page_num: 1, page_size: 10 };
}

function MyNFT() {
  const MIN_NFT_COUNT = 5;
  const { userInfo } = useContext(MobxContext);
  const { isConnected } = useWeb3ModalAccount();
  const [nfts, setNFTs] = useState<(NFTItem | null)[]>(getBaseNFTs());
  const pageInfo = useRef<PageQueryDto>(getBasePageInfo());

  function getBaseNFTs(len = MIN_NFT_COUNT) {
    return Array(len).fill(null);
  }

  const queryNFTList = throttle(async () => {
    try {
      const res = await queryMyNFTListAPI(pageInfo.current);
      const list = (pageInfo.current.page_num === 1 ? [] : nfts).concat(res?.nfts || []);

      // 补足空位
      if (list.length < MIN_NFT_COUNT) {
        list.push(...Array(MIN_NFT_COUNT - list.length).fill(null));
      }

      setNFTs(list);
    } catch (error) {}
  });

  useEffect(() => {
    if (userInfo?.wallet && isConnected) {
      pageInfo.current = getBasePageInfo();
      queryNFTList();
    } else {
      setNFTs(getBaseNFTs());
    }
  }, [userInfo]);

  return (
    <div className="mt-20">
      <div className="font-semakin text-2xl text-basic-yellow">My NFT</div>

      <Divider className="my-[1.875rem]" />

      <div className="flex justify-between items-center gap-[1.6875rem]">
        {nfts.map((nft, index) => (
          <NFT
            name={nft?.token_metadata?.name}
            src={nft?.token_metadata?.animation_url}
            isPending={nft?.transaction_status === 'pending'}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export default observer(MyNFT);
