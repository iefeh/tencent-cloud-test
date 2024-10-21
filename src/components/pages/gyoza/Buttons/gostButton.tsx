import React, { FC } from 'react';
import { Button, ButtonProps, cn } from '@nextui-org/react';

interface IButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const GostButton: FC<IButtonProps> = (props) => {
  const { children, className, ...rest } = props;
  return (
    <Button
      {...rest}
      variant="bordered"
      radius="full"
      className={cn([
        'text-white border-white w-[11.25rem] text-base',
        className && className,
      ])}
    >
      {children}
    </Button>
  );
};

export const BaseButton: FC<IButtonProps> = (props) => {
  const { children, className, ...rest } = props;
  return (
    <Button
      {...rest}
      variant="bordered"
      radius="full"
      className={cn([
        'text-[#2E1A0F] border-[#C6886A] bg-[#F9E9DB] w-[11.25rem] text-base',
        className && className,
      ])}
    >
      {children}
    </Button>
  );
};