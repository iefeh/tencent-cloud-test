import useRAF from '@/hooks/raf';
import { useRef, useEffect } from 'react';
import styles from './styles/slogan.module.css';

interface Props {
  scrollY: number;
}

export default function SloganScreen(props: Props) {
  const sloganRef = useRef<HTMLImageElement>(null);

  const { update } = useRAF({
    base: 100,
    min: -10,
    max: 100,
    baseDuration: 1000,
    getNextTarget: (y) =>
      100 - ((y - document.documentElement.clientHeight) / document.documentElement.clientHeight / 2) * 110,
    callback: (cur) => {
      if (!sloganRef.current) return;

      sloganRef.current.style.setProperty('--tsy', `${cur}vh`);
    },
  });

  useEffect(() => {
    if (props.scrollY < 0) {
      update(-props.scrollY);
    }
  }, [props.scrollY]);

  return (
    <div className="slogan-screen w-full h-screen relative overflow-hidden ">
      <div ref={sloganRef} className={"title uppercase font-semakin text-[6.25rem] absolute left-1/2 top-0 z-20 text-center whitespace-nowrap max-lg:whitespace-normal " + styles.slogan}>
        own your destiny
      </div>
    </div>
  );
}
