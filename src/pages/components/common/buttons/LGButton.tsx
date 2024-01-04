'use client';

import { Button, cn } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

interface Props {
  label: string;
  link?: string;
  className?: string;
  loading?: boolean;
  actived?: boolean;
  disabled?: boolean;
  squared?: boolean;
  onClick?: () => void;
}

export default function LGButton(props: Props) {
  const { loading, actived, disabled, onClick, link, squared } = props;
  const router = useRouter();
  const onLinkClick = () => {
    if (!link) return;

    if (/^http/.test(link)) {
      window.open(link);
    } else {
      router.push(link);
    }
  };

  return (
    <Button
      className={cn([
        'lg-button h-auto text-sm px-6 py-1 border-2 border-solid text-white transition-all duration-1000 font-poppins-medium bg-transparent cursor-pointer box-border',
        'hover:border-none hover:px-[calc(1.5rem_+_2px)] hover:py-[calc(0.25rem_+_2px)] hover:text-black hover:bg-[linear-gradient(80deg,#D9A970,#EFEBC5)]',
        !disabled &&
          actived &&
          'border-none px-[calc(1.5rem_+_2px)] py-[calc(0.25rem_+_2px)] text-black bg-[linear-gradient(80deg,#D9A970,#EFEBC5)]',
        disabled && 'text-[#999] border-[#999] opacity-100',
        squared ? 'rounded-[0.625rem]' : 'rounded-3xl',
        props.className,
      ])}
      isLoading={loading}
      isDisabled={disabled}
      onPress={onClick || (link && onLinkClick) || undefined}
    >
      {props.label}
    </Button>
  );
}
