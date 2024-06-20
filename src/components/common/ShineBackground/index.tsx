import { FC, useEffect, useRef } from 'react';
import styles from './index.module.css';

interface Props {
  count?: number;
}

const ShineBackground: FC<Props> = ({ count }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  function init() {
    if (!containerRef.current?.parentElement) return;

    containerRef.current.innerHTML = '';

    const { scrollWidth, scrollHeight } = containerRef.current.parentElement;
    containerRef.current.style.width = `${scrollWidth}px`;
    containerRef.current.style.height = `${scrollHeight}px`;

    const starsCount = count || (scrollHeight < window.innerHeight * 1.5 ? 20 : 200);

    for (let i = 0; i < starsCount; i++) {
      const star = document.createElement('div');
      star.className = styles.star;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 8000}ms`;
      containerRef.current.appendChild(star);
    }
  }

  useEffect(() => {
    init();

    containerRef.current?.addEventListener('resize', init);
  }, []);

  return <div ref={containerRef} className="absolute left-0 top-0"></div>;
};

export default ShineBackground;
