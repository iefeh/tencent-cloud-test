import { useUserContext } from '@/store/User';
import { Button, ButtonProps, cn } from '@nextui-org/react';
import type { CSSProperties, FC } from 'react';

type StrokeType = 'yellow' | 'blue' | 'brown' | 'gray' | 'ticket';

interface Props extends ButtonProps {
  strokeType: StrokeType;
  strokeText: string;
  needAuth?: boolean;
}

const StrokeColors = {
  yellow: '#7A0A08',
  blue: '#08507a',
  brown: '#7a0a08',
  gray: '#515151',
  ticket: '#7A0A08',
};

const ShortButton: FC<Props> = ({
  strokeType,
  strokeText,
  needAuth,
  style: { backgroundImage, ...restStyle } = {},
  className,
  isDisabled,
  onPress,
  ...rest
}) => {
  const { userInfo, toggleLoginModal } = useUserContext();

  function handlePress(e: any) {
    if (needAuth && !userInfo) {
      toggleLoginModal(true);
      return;
    }

    onPress?.(e);
  }

  return (
    <Button
      className={cn([
        'bg-transparent bg-[length:100%_100%] bg-no-repeat',
        'rounded-[1.625rem]',
        '!opacity-100',
        'w-[5.8125rem] h-[3.422rem] text-[1.03125rem] leading-[1.125rem]',
        strokeType === 'ticket' ? 'border-2 border-[#433127]/50 cursor-default bg-[#F7E9CC]' : '',
        isDisabled && 'grayscale',
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
              : `url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_${strokeType}_short.png')`,
          ...restStyle,
        } as CSSProperties
      }
      onPress={handlePress}
      {...rest}
    >
      <span className="[&:before]:whitespace-normal stroke-text-normal" data-text={strokeText}></span>
    </Button>
  );
};

export default ShortButton;
