import { cn } from '@nextui-org/react';
import { FC, useEffect, useRef } from 'react';

const MeteorLayer: FC<ClassNameProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const meteorCountRef = useRef(0);

  function pray() {
    if (!containerRef.current) return;

    const fontSize = parseInt(document.documentElement.style.fontSize);
    const { clientWidth, clientHeight } = containerRef.current;

    // 最大宽度加上流星本身的宽度
    const meteorSize = fontSize * 5.75;
    const timeout = Math.random() * 10000 + 1000;
    const meteor = document.createElement('img');
    meteor.src = '/img/loyalty/season/meteor.png';
    meteor.style.position = 'absolute';
    meteor.style.left = '0px';
    meteor.style.top = '0px';
    meteor.style.width = '5.75rem';
    meteor.style.height = '4.875rem';
    meteor.style.pointerEvents = 'none';
    meteor.style.userSelect = 'none';
    meteor.style.transition = 'transform 16s linear';
    const fullWidth = clientWidth + meteorSize;
    const sourceX = fullWidth * (Math.random() + 0.5);
    const targetY = sourceX * Math.tan(Math.PI / 4);
    meteor.style.transform = `translate3d(${sourceX}px, -${meteorSize}px, 0)`;

    meteor.addEventListener('transitionend', () => {
      try {
        containerRef.current?.removeChild(meteor);
      } catch (error) {}
      meteorCountRef.current = Math.max(meteorCountRef.current - 1, 0);
      if (meteorCountRef.current <= 1) {
        pray();
      }
    });
    containerRef.current.appendChild(meteor);

    setTimeout(() => {
      meteor.style.transform = `translate3d(0px, ${targetY}px, 0)`;
      meteorCountRef.current++;
    }, timeout);

    if (Math.random() > 0.7) {
      setTimeout(pray, Math.random() * 500 + 200);
    }
  }

  useEffect(() => {
    pray();
  }, []);

  return (
    <div ref={containerRef} className={cn(['absolute inset-0 overflow-hidden pointer-events-none', className])}></div>
  );
};

export default MeteorLayer;
