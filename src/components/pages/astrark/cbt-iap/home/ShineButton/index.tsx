import { Button, ButtonProps, cn } from '@nextui-org/react';
import { FC } from 'react';
import styles from './index.module.scss';

interface Props extends ButtonProps {
  iconName: string;
  size: 'sm' | 'md' | 'lg';
}

const ShineButton: FC<Props> = ({ size, iconName, className, ...props }) => {
  return (
    <Button
      startContent={<div className={cn(['w-9 aspect-square bg-contain bg-no-repeat start-content', iconName])}></div>}
      {...props}
      className={cn([
        'bg-transparent bg-center bg-no-repeat p-0 h-auto font-semakin text-xl leading-6 !transition-none group hover:text-basic-yellow',
        styles[`${size}Btn`],
        styles.btn,
        className,
      ])}
    />
  );
};

export default ShineButton;
