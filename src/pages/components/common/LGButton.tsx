'use client';

import { cn } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

interface Props {
  label: string;
  link?: string;
  className?: string;
  actived?: boolean;
  onClick?: () => void;
}

export default function LGButton(props: Props) {
  const { actived } = props;
  const router = useRouter();
  const onLinkClick = () => {
    if (!props.link) return;

    if (/^http/.test(props.link)) {
      window.open(props.link);
    } else {
      router.push(props.link);
    }
  };

  return (
    <button
      className={cn([
        'basic-button uppercase text-sm px-6 py-1 border border-solid rounded-3xl  transition-all duration-1000 font-poppins-medium hover:border-transparent hover:text-black hover:bg-[linear-gradient(80deg,#D9A970,#EFEBC5)]',
        actived ? 'border-transparent text-black bg-[linear-gradient(80deg,#D9A970,#EFEBC5)]' : 'text-white',
        props.className,
      ])}
      onClick={props.onClick || (props.link && onLinkClick) || undefined}
    >
      {props.label}
    </button>
  );
}
