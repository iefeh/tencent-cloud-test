import React, { FC } from 'react';
import { cn } from '@nextui-org/react';

interface GyozaHomeProps {
  children: React.ReactNode;
  showMask?: boolean;
}

const GyozaHome: FC<GyozaHomeProps> = (props) => {
  const { showMask = false } = props;
  return (
    <div
      className={cn([
        "z-10 w-full h-full bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/home/bg_banner.png')] bg-[length:100%_auto] bg-no-repeat text-white",
      ])}
    >
      <div className={cn([
        'w-full h-full',
        showMask && 'backdrop-blur-sm bg-black/10'
      ])}>
        {props.children}
      </div>
    </div>
  )
}

export default GyozaHome;