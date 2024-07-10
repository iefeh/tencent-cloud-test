import { BASE_CLIENT_HEIGHT, BASE_CLIENT_WIDTH } from '@/constant/common';
import { cn } from '@nextui-org/react';
import { useEffect, useState } from 'react';

export default function ShadowBorder({ isResizing }: { isResizing: boolean }) {
  const [shadowWidth, setShadowWidth] = useState(BASE_CLIENT_WIDTH);
  const [shadowHeight, setShadowHeight] = useState(BASE_CLIENT_HEIGHT);

  function onResize() {
    const { innerWidth, innerHeight } = window;
    const ratio = Math.min(innerWidth / BASE_CLIENT_WIDTH, innerHeight / BASE_CLIENT_HEIGHT);
    setShadowWidth(innerWidth * ratio);
    setShadowHeight(innerHeight * ratio);
    if (innerWidth / BASE_CLIENT_WIDTH > innerHeight / BASE_CLIENT_HEIGHT) {
      setShadowWidth((innerHeight * BASE_CLIENT_WIDTH) / BASE_CLIENT_HEIGHT);
      setShadowHeight(innerHeight);
    } else {
      setShadowWidth(innerWidth);
      setShadowHeight((innerWidth * BASE_CLIENT_HEIGHT) / BASE_CLIENT_WIDTH);
    }
  }

  useEffect(() => {
    onResize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className={cn([
        'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 shadow-[inset_0_0_4rem_2rem_#000]',
        isResizing && 'invisible',
      ])}
      style={{ width: `${shadowWidth}px`, height: `${shadowHeight}px` }}
    ></div>
  );
}
