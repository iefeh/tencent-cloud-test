'use client';

import { Button, cn } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface Props {
  label: string;
  link?: string;
  className?: string;
  loading?: boolean;
  actived?: boolean;
  disabled?: boolean;
  squared?: boolean;
  onClick?: () => void;
  hasCD?: boolean;
  cd?: number;
  onCDOver?: () => void;
  prefix?: string | JSX.Element;
  suffix?: string | JSX.Element;
}

export default function LGButton(props: Props) {
  const { loading, actived, disabled, onClick, link, squared, prefix, suffix, hasCD, cd = 10, onCDOver } = props;
  const router = useRouter();
  const onLinkClick = () => {
    if (!link) return;

    if (/^http/.test(link)) {
      window.open(link);
    } else {
      router.push(link);
    }
  };
  const targetTimestamp = useRef(0);
  const rafId = useRef(0);
  const cdMaskRef = useRef<HTMLDivElement>(null);

  function loopCD(el = performance.now()) {
    const leftTime = targetTimestamp.current - el;
    if (leftTime <= 0) {
      onCDOver?.();
      targetTimestamp.current = 0;
      rafId.current = 0;
      return;
    }

    if (!cdMaskRef.current) return;
    const progress = 1 - leftTime / cd / 1000;
    cdMaskRef.current.style.transform = `scaleY(${progress})`;
    rafId.current = requestAnimationFrame(loopCD);
  }

  useEffect(() => {
    if (!hasCD) {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    } else {
      targetTimestamp.current = performance.now() + cd * 1000;
      loopCD();
    }

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, [hasCD]);

  return (
    <Button
      className={cn([
        'h-auto text-sm px-6 py-1 border-2 border-solid text-white transition-all duration-1000 font-poppins-medium bg-transparent cursor-pointer box-border',
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
      <div className={cn(['relative inline-flex items-center z-10'])}>
        {prefix}
        {props.label}
        {suffix}
      </div>

      {hasCD && (
        <div
          ref={cdMaskRef}
          className="absolute left-0 bottom-0 w-full h-full z-20 origin-bottom bg-[rgba(255,255,255,0.3)]"
        ></div>
      )}
    </Button>
  );
}
