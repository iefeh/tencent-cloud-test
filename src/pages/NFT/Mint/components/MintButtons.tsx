import BasicButton from '@/pages/components/common/BasicButton';
import { useContext, useState } from 'react';
import { MintContext } from '..';
import { observer } from 'mobx-react-lite';
import { Input } from '@nextui-org/react';
import { MintStatus } from '@/constant/mint';
import Image from 'next/image';
import plusIconImg from 'img/nft/mint/icon_plus.png';
import minusIconImg from 'img/nft/mint/icon_minus.png';

function MintButtons() {
  const { status, maxCount, mintInfo, onMintOperation } = useContext(MintContext);
  const [count, setCount] = useState('0');

  function onValueChange(val: string) {
    const text = val.replace(/[^0-9]/g, '').replace(/^0+/g, '') || '0';
    setCount(Math.min(Math.max(0, +text), maxCount) + '');
  }

  function onMinus() {
    setCount(Math.min(Math.max(0, +count - 1), maxCount) + '');
  }

  function onPlus() {
    setCount(Math.min(Math.max(0, +count + 1), maxCount) + '');
  }

  return (
    <div className="mt-8 flex items-center font-poppins h-[2.625rem] gap-[1.125rem]">
      {status === MintStatus.WHITELISTED && (
        <Input
          className=""
          classNames={{
            inputWrapper:
              'border border-solid border-basic-yellow rounded-3xl transition-all duration-500 delay-75 outline-none !bg-black h-full',
            input: '!text-basic-yellow text-center h-full',
          }}
          type="text"
          value={count}
          startContent={
            <Image
              className="w-[1.125rem] h-[1.125rem] cursor-pointer object-contain"
              src={minusIconImg}
              alt=""
              onClick={onMinus}
            />
          }
          endContent={
            <Image
              className="w-[1.125rem] h-[1.125rem] cursor-pointer object-contain"
              src={plusIconImg}
              alt=""
              onClick={onPlus}
            />
          }
          onValueChange={onValueChange}
        />
      )}

      <BasicButton
        className="shrink-0 h-full normal-case"
        label={mintInfo.buttonLabel}
        active
        disabled={+count < 1}
        onClick={onMintOperation}
      />
    </div>
  );
}

export default observer(MintButtons);
