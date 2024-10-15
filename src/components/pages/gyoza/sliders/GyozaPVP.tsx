import React, { FC } from "react";
import S3Image from '@/components/common/medias/S3Image';
import { GostButton, BaseButton } from '../Buttons/gostButton'

interface IProps {
  toPrev: () => void;
  toNext: () => void;
}

const pvpImgUrl = '/minigames/miner/versus.png'

const GyozaPVP: FC<IProps> = (props) => {
  const { toPrev, toNext } = props

  return (
    <div className="absolute w-[65.25rem] top-[15.9375rem] right-[50%] translate-x-1/2">
      <S3Image src={pvpImgUrl} className='relative w-full object-contain h-[26.25rem]' />
      <div className="mx-[6.5rem] font-[1.125rem]">
        In the mystical realm of Flaming Pets, Pirates and Sprite Guardians clash in an age-old conflict. Legends tell of 25 enchanted castles, each guarded by resilient Animal Spirits. These castles, filled with power, attract adventurers from afar to join an endless saga of strategy and conquest.
      </div>
      <div className="text-center pt-[3rem]">
        <GostButton className="mr-[1.3125rem]" onClick={toPrev}>Skip</GostButton>
        <BaseButton onClick={toNext}>Continue </BaseButton>
      </div>
    </div>
  )
}

export default GyozaPVP;