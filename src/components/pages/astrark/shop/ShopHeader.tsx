import S3Image from '@/components/common/medias/S3Image';
import { formatUserName } from '@/utils/common';
import { Button } from '@nextui-org/react';
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { FC } from 'react';
import usePurchaseOverview from './CateTabs/usePurchaseOverview';

const ShopHeader: FC = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const { data } = usePurchaseOverview();

  function onConnectWallet() {
    if (isConnected) return;

    open();
  }

  return (
    <div className="relative z-0 flex items-center pt-3 pl-[0.875rem]">
      <Button className="p-0 bg-transparent rounded-none" disableRipple>
        <S3Image className="w-12 h-[3.375rem] object-contain" src="/astrark/shop/icons/icon_back_head.png" />

        <div className="relative w-[12.3125rem] h-[1.875rem] -ml-[0.1875rem] text-[#77CFF4] text-2xl leading-7 pl-ten">
          <S3Image className="object-contain" src="/astrark/shop/bg_head.png" fill />
          Black Market
        </div>
      </Button>

      <Button
        className="bg-black/30 border-1 border-[#323A43]/30 rounded-none px-5 py-2 -mt-[0.375rem] h-auto"
        disableRipple
        onPress={onConnectWallet}
      >
        <S3Image className="w-[1.3125rem] h-[1.125rem] object-contain" src="/astrark/shop/icons/icon_wallet.png" />

        <span className="text-white text-base leading-none">
          {isConnected ? formatUserName(address) : 'Connect wallet'}
        </span>
      </Button>

      <div className="flex items-center bg-black/30 border-1 border-[#323A43] mb-1 ml-4 h-[2.125rem] px-4 pb-1">
        <S3Image className="w-6 h-6" src="/astrark/shop/icons/checked.png" />

        <div className="mt-1 ml-3 leading-none">
          Confirmed Purchase :
          <span className="text-[#FCD369] ml-3">{data ? data.confirmed_purchase_count || 0 : '--'}</span>
        </div>
      </div>

      <div className="flex items-center bg-black/30 border-1 border-[#323A43] mb-1 ml-4 h-[2.125rem] px-4 pb-1">
        <S3Image className="w-6 h-6" src="/astrark/shop/icons/processing.png" />

        <div className="mt-1 ml-3 leading-none">
          Pending Purchase :
          <span className="text-[#31B73D] ml-3">{data ? data.pending_purchase_count || 0 : '--'}</span>
        </div>
      </div>

      <div className="w-[16.8125rem] aspect-[269/134] absolute top-0 right-5 z-50">
        <S3Image className="object-contain mr-3" src="/astrark/shop/bg_ad.png" fill />

        <div className="rounded-full w-[4.875rem] aspect-square absolute left-7 top-1/2 -translate-y-1/2">
          <S3Image className="object-contain animate-spin5 w-full h-full" src="/astrark/shop/circle_text.png" />
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;
