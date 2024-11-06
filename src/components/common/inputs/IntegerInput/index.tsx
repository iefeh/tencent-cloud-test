import { Input, InputProps, cn } from '@nextui-org/react';
import Image from 'next/image';
import { CSSProperties, FC } from 'react';

interface Props extends InputProps {
  min?: number;
  max?: number;
}

const IntegerInput: FC<Props> = ({ value, min = 0, max = 0, classNames, onValueChange, style, ...props }) => {
  function onInput(val: string) {
    const res = +(val.replace(/[^0-9]/g, '') || 0);
    onIntChange(res);
  }

  function onIntChange(val: number) {
    const realVal = Math.max(Math.min(val, max), min);
    onValueChange?.(realVal.toString());
  }

  function onMinus() {
    const res = Number(value || 0) - 1;
    onIntChange(res);
  }

  function onPlus() {
    const res = Number(value || 0) + 1;
    onIntChange(res);
  }

  return (
    <Input
      type="text"
      classNames={{
        base: 'w-[8.125rem] h-10',
        inputWrapper: 'h-full !bg-transparent shadow-none border-2 border-[#6E4C32]',
        input: '!text-yellow-1 text-2xl stroke-content text-center',
        ...classNames,
      }}
      value={value}
      onValueChange={onInput}
      style={{ '--stroke-color': '#7A0A08' } as CSSProperties}
      startContent={
        <Image
          className={cn([
            'object-contain w-[1.125rem] aspect-square cursor-pointer',
            Number(value) <= min && 'grayscale cursor-not-allowed',
          ])}
          src="https://d3dhz6pjw7pz9d.cloudfront.net/minigames/icons/icon_minus.png"
          alt=""
          width={36}
          height={36}
          unoptimized
          priority
          onClick={onMinus}
        />
      }
      endContent={
        <Image
          className={cn([
            'object-contain w-[1.125rem] aspect-square cursor-pointer',
            Number(value) >= max && 'grayscale, cursor-not-allowed',
          ])}
          src="https://d3dhz6pjw7pz9d.cloudfront.net/minigames/icons/icon_plus.png"
          alt=""
          width={36}
          height={36}
          unoptimized
          priority
          onClick={onPlus}
        />
      }
      {...props}
    />
  );
};

export default IntegerInput;
