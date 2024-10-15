import React, { FC } from "react";
import S3Image from '@/components/common/medias/S3Image';
import { GostButton, BaseButton } from "../Buttons/gostButton";

interface IProps {
  toPrev: () => void;
  toNext: () => void;
}

const castlesImgUrl = '/minigames/miner/guide_castle_green.png'

const GyozaCastle: FC<IProps> = (props) => {
  const { toPrev, toNext } = props;

  return (
    <div className="flex absolute h-[22.6875rem] top-[14.375rem] right-[50%] translate-x-1/2">
      <S3Image src={castlesImgUrl} className='object-contain mr-[1.375rem] relative h-full w-[36.375rem] shrink-0' />
      <div className="inline-block">
        <div className="w-[32.25rem] mt-[6.875rem] mb-[3.3125rem] text-lg">In this secret experimental project by Moonveil, players have the freedom to join any castle that has not been destroyed by pirates. Choose your castle and align with the Animal Spirits to protect and develop your stronghold.</div>
        <div>
          <GostButton className="mr-[1.3125rem]" onClick={toPrev}>Previous</GostButton>
          <BaseButton onClick={toNext}>Continue </BaseButton>
        </div>
      </div>
    </div>
  );
};

export default GyozaCastle;