import Image from 'next/image';
import loadingImg from 'img/loading/loading.png';
import { useEffect, useRef } from 'react';
import { cn } from '@nextui-org/react';

export default function CircularLoading({
  noBlur,
  loadingText = 'Loading',
  className,
  cirleClassName,
}: {
  noBlur?: boolean;
  loadingText?: string;
  className?: string;
  cirleClassName?: string;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nodeRef.current || !nodeRef.current.parentElement) return;

    const { style } = nodeRef.current.parentElement;
    if (style.position !== 'static') return;
    style.position = 'relative';
  }, []);

  return (
    <div
      ref={nodeRef}
      className={cn([
        'absolute left-0 top-0 w-full h-full flex items-center justify-center bg-overlay/30 z-[999] origin-center',
        noBlur || 'backdrop-saturate-150 backdrop-blur-md',
        className,
      ])}
    >
      <div
        className={cn(['relative w-[8.125rem] h-[8.125rem] text-center leading-[8.125rem]', cirleClassName])}
        aria-label="Loading..."
      >
        <Image className="overflow-hidden rounded-full animate-spin" src={loadingImg} alt="" fill sizes="100%" />
        <span className="relative z-0 font-semakin text-basic-yellow">{loadingText}</span>
      </div>
    </div>
  );
}
