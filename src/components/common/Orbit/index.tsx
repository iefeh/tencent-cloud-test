import { cn } from '@nextui-org/react';
import { FC, useEffect, useRef } from 'react';

interface Props {
  className?: string;
  scale?: number;
  speed?: number;
  defaultDeg?: number;
  star?: JSX.Element;
  antiClock?: boolean;
  sinkTime?: number;
  isCircle?: boolean;
}

const Orbit: FC<Props> = ({
  className,
  scale = 1,
  speed = 1,
  defaultDeg = 0,
  star,
  antiClock,
  sinkTime = 2000,
  isCircle,
}) => {
  const size = `${scale}rem`;
  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const maxDegRef = useRef(Infinity);
  const rafIdRef = useRef(0);
  const lastElRef = useRef(0);
  const lastDegRef = useRef(defaultDeg);
  const isSinkingRef = useRef(false);
  const isSunriseRef = useRef(false);

  function runOrbitAni(el: number) {
    if (!starRef.current) return;

    const diff = el - lastElRef.current;
    if (diff < 8) {
      rafIdRef.current = requestAnimationFrame(runOrbitAni);
      return;
    }

    if (!isCircle) {
      if (isSinkingRef.current) {
        if (diff >= sinkTime) {
          isSinkingRef.current = false;
          lastElRef.current = el;
          isSunriseRef.current = true;
          starRef.current.style.visibility = 'visible';
        }
        rafIdRef.current = requestAnimationFrame(runOrbitAni);
        return;
      }

      if (isSunriseRef.current) {
        isSunriseRef.current = false;
      } else if (Math.abs(Math.abs(lastDegRef.current) - Math.abs(maxDegRef.current)) < Number.EPSILON) {
        lastDegRef.current = -lastDegRef.current;

        isSinkingRef.current = true;
        starRef.current.style.visibility = 'hidden';
        rafIdRef.current = requestAnimationFrame(runOrbitAni);
        return;
      }
    }

    const diffDeg = diff * speed * 0.005 * (antiClock ? -1 : 1);
    let currentDeg = (lastDegRef.current + diffDeg) % 360;

    if (!isCircle) {
      currentDeg = Math.max(Math.min(currentDeg, maxDegRef.current), -maxDegRef.current);
    }

    starRef.current.style.transform = `rotateZ(${currentDeg}deg) translateY(-${scale / 2}rem)`;

    lastDegRef.current = currentDeg;
    lastElRef.current = el;
    rafIdRef.current = requestAnimationFrame(runOrbitAni);
    starRef.current.style.transform = `-translateY(50%)`;
  }

  useEffect(() => {
    if (!containerRef.current || !starRef.current) return;
    const { parentElement, clientWidth } = containerRef.current;

    if (!isCircle) {
      // 留出星体宽度，防止日落时仍然可见
      const maxWidth = (parentElement?.clientWidth || 0) + starRef.current.clientWidth * 2;
      if (!maxWidth) return;

      maxDegRef.current = Math.abs((Math.asin(maxWidth / clientWidth) * 180) / Math.PI);
    }

    lastElRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(runOrbitAni);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn([
        'rounded-full border-1 border-basic-yellow/10 relative',
        'flex justify-center items-center',
        className,
      ])}
      style={{ width: size, height: size }}
    >
      {star && <div ref={starRef}>{star}</div>}
    </div>
  );
};

export default Orbit;
