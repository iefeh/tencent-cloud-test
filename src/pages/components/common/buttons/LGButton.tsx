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
  onClick?: () => void;
}

export default function LGButton(props: Props) {
  const { loading, actived, disabled, onClick, link } = props;
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
        'lg-button h-auto uppercase text-sm px-6 py-1 border-2 border-solid rounded-3xl text-white transition-all duration-1000 font-poppins-medium bg-transparent hover:border-transparent hover:text-black hover:bg-[linear-gradient(80deg,#D9A970,#EFEBC5)] cursor-pointer',
        !disabled && actived && 'border-none text-black bg-[linear-gradient(80deg,#D9A970,#EFEBC5)]',
        disabled && 'text-[#999] border-[#999] opacity-100',
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
