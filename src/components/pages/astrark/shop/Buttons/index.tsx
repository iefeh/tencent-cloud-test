import React from 'react';
import { Button, type ButtonProps, cn } from '@nextui-org/react';

enum ButtonStatus {
  DISABLED = 'disabled',
  WAIT = 'wait',
}

export type ButtonStatusUnion = `${ButtonStatus}` | undefined;

interface Props extends ButtonProps {
  children: React.ReactNode;
  index?: number;
  btnStatus?: ButtonStatusUnion;
}


const disabledBg = `
  bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/btn_disable_bg.png')] 
  w-[9rem] h-[2.625rem] mt-2
  `
const PayButton: React.FC<Props> = (props) => {
  const { children, btnStatus, index, className, ...rest } = props;

  return (
    <Button
      className={cn([
        "text-[#5D3C13] text-[1.1875rem] rounded-none bg-transparent",
        "w-[10.1875rem] h-[3.625rem] bg-no-repeat bg-center bg-[length:100%_100%]",
        "bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/btn_buy_now.png')]",
        "[text-shadow:0px_2px_0px_#FFE77F]",
        className,
        [ButtonStatus.DISABLED, ButtonStatus.WAIT].includes(btnStatus as any) && `${disabledBg} [text-shadow:none] pointer-events-none text-white`,
        btnStatus === ButtonStatus.WAIT && 'opacity-40'
      ])}

      {...rest}
    >
      {index !== undefined &&
        <div
          className={
            cn([
              "flex-shrink-0 rounded-full w-[1.1875rem] h-[1.1875rem] bg-[#5D3C13] text-white text-sm [text-shadow:none]",
              [ButtonStatus.DISABLED, ButtonStatus.WAIT].includes(btnStatus as any) && 'bg-white !text-[#333]',
            ])}
        >
          {index}
        </div>
      }
      {props.children}
    </Button>
  )
}

export default PayButton;