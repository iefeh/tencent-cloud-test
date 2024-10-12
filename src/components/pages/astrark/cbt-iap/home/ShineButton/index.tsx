import { Button, ButtonProps, cn } from '@nextui-org/react';
import { FC } from 'react';
import styles from './index.module.scss';

interface Props extends ButtonProps {
  size: 'sm' | 'md' | 'lg';
}

const ShineButton: FC<Props> = ({ size, className, ...props }) => {
  return (
    <Button
      {...props}
      className={cn([
        'bg-transparent bg-center bg-no-repeat p-0 h-auto font-semakin text-xl leading-6 !transition-none',
        styles[`${size}Btn`],
        className,
      ])}
    />
  );
};

export default ShineButton;
