import { observer } from 'mobx-react-lite';
import loadingImg from 'img/nft/mint/loading.png';
import triangleImg from 'img/nft/trifle/triangle.png';
import Image from 'next/image';
import { useContext } from 'react';
import { MintContext } from '..';
import { cn } from '@nextui-org/react';

function MintLoading() {
  const { loading } = useContext(MintContext);

  return (
    <div className={cn(['absolute inset-0 flex justify-center items-center z-50', loading ? 'block' : 'hidden'])}>
      <div className="bg-black absolute inset-0 z-0"></div>

      <div className="w-[7.375rem] h-[7.375rem] relative z-10 border-1 border-[rgba(246,199,153,0.2)] rounded-full flex justify-center items-center">
        <Image
          className="object-cover animate-spin5 !w-[calc(100%_+_0.5rem)] !h-[calc(100%_+_0.5rem)] relative !-top-1"
          src={loadingImg}
          alt=""
          fill
          sizes="100%"
        />

        <Image className="relative w-[2.3125rem] h-[2.0625rem] z-10" src={triangleImg} alt="" />
      </div>
    </div>
  );
}

export default observer(MintLoading);
