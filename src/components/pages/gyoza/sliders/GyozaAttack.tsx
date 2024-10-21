import React, { FC } from "react";
import S3Image from '@/components/common/medias/S3Image';
import { GostButton, BaseButton } from "../Buttons/gostButton";

interface IProps {
  toPrev: () => void;
  toNext: () => void;
}

const attackImgUrl = '/minigames/miner/guide_cannon.png';

const GyozaAttack: FC<IProps> = (props) => {
  const { toPrev, toNext } = props;

  return (
    <div className="flex absolute h-[20.125rem] top-[14.375rem] right-[50%] translate-x-1/2">
      <div className="inline-block">
        <div className="w-[32.25rem] mt-[6.875rem] mb-[3.3125rem] text-lg">
          Strategically complete missions and upgrade your chosen castle to ensure its rise to ultimate victory amidst relentless bombardment. Rich rewards await those who prove their worth.
        </div>
        <div>
          <GostButton className="mr-[1.3125rem]" onClick={toPrev}>Previous</GostButton>
          <BaseButton onClick={toNext}>Continue </BaseButton>
        </div>
      </div>

      <S3Image src={attackImgUrl} className='mr-[1.375rem] relative h-full w-[34.25rem] shrink-0' />
    </div>
  )
}

export default GyozaAttack;