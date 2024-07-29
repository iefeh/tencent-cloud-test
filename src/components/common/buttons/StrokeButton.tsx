import { Button, ButtonProps, cn } from '@nextui-org/react';
import type { CSSProperties, FC } from 'react';

type StrokeType = 'yellow' | 'blue' | 'brown' | 'gray' | 'ticket';

interface Props extends ButtonProps {
  strokeType: StrokeType;
  strokeText: string;
}

const StrokeColors = {
  yellow: '#7A0A08',
  blue: '#08507a',
  brown: '#7a0a08',
  gray: '#515151',
  ticket: '#7A0A08',
};

const StrokeButton: FC<Props> = ({
  strokeType,
  strokeText,
  style: { backgroundImage, ...restStyle } = {},
  className,
  isDisabled,
  ...rest
}) => {
  if (isDisabled) strokeType = 'gray';

  return (
    <Button
      className={cn([
        'bg-transparent bg-[length:100%_100%] bg-no-repeat',
        'w-[10.875rem] h-[3.25rem] text-lg rounded-[1.625rem]',
        'opacity-100',
        className,
      ])}
      isDisabled={isDisabled}
      data-text={strokeText}
      style={
        {
          '--stroke-color': StrokeColors[strokeType],
          backgroundImage:
            !!backgroundImage && !isDisabled
              ? backgroundImage
              : `url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_${strokeType}.png')`,
          ...restStyle,
        } as CSSProperties
      }
      {...rest}
    >
      <span className="stroke-text-normal" data-text={strokeText}></span>
    </Button>
  );
};

export default StrokeButton;
