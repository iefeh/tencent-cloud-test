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

const StrokeButton: FC<Props> = ({
  strokeType,
  strokeText,
  needAuth,
  style: { backgroundImage, ...restStyle } = {},
  className,
  isDisabled,
  onPress,
  ...rest
}) => {
  const {userInfo, toggleLoginModal} = useUserContext();
  if (isDisabled) strokeType = 'gray';

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
        'w-[10.875rem] h-[3.25rem] text-lg rounded-[1.625rem]',
        '!opacity-100',
        strokeType === 'ticket' && '!rounded-xl cursor-default',
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
              : `url('https://d3dhz6pjw7pz9d.cloudfront.net/minigames/btn_${strokeType}.png')`,
          ...restStyle,
        } as CSSProperties
      }
      onPress={handlePress}
      {...rest}
    >
      <span className="stroke-text-normal" data-text={strokeText}></span>
    </Button>
  );
};

export default StrokeButton;
