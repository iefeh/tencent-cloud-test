import BasicButton from '@/pages/components/common/BasicButton';
import { useContext } from 'react';
import { MintContext } from '..';
import { observer } from 'mobx-react-lite';
import { Input } from '@nextui-org/react';
import Image from 'next/image';
import plusIconImg from 'img/nft/mint/icon_plus.png';
import minusIconImg from 'img/nft/mint/icon_minus.png';
import useMint from '@/hooks/useMint';

function MintButtons() {
  const { mintCount, setMintCount, onButtonClick } = useMint();
  const { loading, canMint, isReady, minted, nowCount, mintInfo } = useContext(MintContext);

  function onValueChange(val: string | number) {
    const text = (val + '').replace(/[^0-9]/g, '').replace(/^0+/g, '') || '0';
    setMintCount(Math.min(Math.max(0, +text), nowCount) + '');
  }

  function onMinus() {
    setMintCount(Math.min(Math.max(0, +mintCount - 1), nowCount) + '');
  }

  function onPlus() {
    setMintCount(Math.min(Math.max(0, +mintCount + 1), nowCount) + '');
  }

  if (!mintInfo.buttonLabel) return null;

  return (
    <div className="mt-8 flex items-center font-poppins h-[2.625rem] gap-[1.125rem]">
      {canMint && isReady && (
        <Input
          className=""
          classNames={{
            inputWrapper:
              'border border-solid border-basic-yellow rounded-3xl transition-all duration-500 delay-75 outline-none !bg-black h-full',
            input: '!text-basic-yellow text-center h-full',
          }}
          type="text"
          value={mintCount}
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
        disabled={loading || mintInfo.buttonDisabled || (canMint && isReady && !minted && +mintCount < 1)}
        onClick={onButtonClick}
      />
    </div>
  );
}

export default observer(MintButtons);
