import React, { FC } from "react";
import S3Image from '@/components/common/medias/S3Image';
import { Button, cn } from '@nextui-org/react';

interface IProps {
  toPrev: () => void;
}

const titleImgUrl = '/minigames/miner/title_play_now.png'

const GyozaPlay: FC<IProps> = (props) => {
  const { toPrev } = props;

  return (
    <div className="absolute h-[18.75rem] top-[14.375rem] right-[50%] translate-x-1/2">
      <div className="relative w-[36.75rem] h-[23.6875rem] bg-[#F9E9DB] opacity-90 rounded-t-[6.25rem] rounded-b-[1.875rem]">
        <S3Image src={titleImgUrl} className="absolute w-[29.1875rem] h-[12.9375rem] top-[-5.25rem] right-[50%] translate-x-1/2" />
        <div className="pt-[10.625rem] px-[3.375rem] text-2xl text-[#2E1A0F]">
          Join forces with the Animal Spirits. Choose your castle and start your adventure today!
        </div>

        <Button
          onClick={toPrev}
          className={cn([
            'absolute bottom-0 right-[50%] translate-x-1/2 translate-y-1/2',
            'rounded-[2.5rem] border-[#C6886A] bg-[#ebab8b] text-[#2E1A0F] text-[1.75rem] w-[18.75rem] h-[5rem]',
            'shadow-[0px_5px_18px_2px_rgba(46,26,15,0.5)]'
          ])}
          variant="bordered"
        >
          Play Now
        </Button>
      </div>
    </div>
  )
}

export default GyozaPlay;

