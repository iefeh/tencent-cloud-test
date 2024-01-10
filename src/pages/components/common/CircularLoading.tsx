import Image from 'next/image';
import loadingImg from 'img/loading/loading.png';
import { useEffect, useRef } from 'react';

export default function CircularLoading() {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nodeRef.current || !nodeRef.current.parentElement) return;

    const { style } = nodeRef.current.parentElement;
    if (style.position !== 'static') return;
    style.position = 'relative';
  }, []);

  return (
    <div ref={nodeRef} className="absolute left-0 top-0 w-full h-full flex items-center justify-center backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-[999]">
      <div className="relative w-[8.125rem] h-[8.125rem] text-center leading-[8.125rem]" aria-label="Loading...">
        <Image className="overflow-hidden rounded-full animate-spin" src={loadingImg} alt="" fill />
        <span className="relative z-0 font-semakin text-basic-yellow">Loading</span>
      </div>
    </div>
  );
}
