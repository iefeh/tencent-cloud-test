import { useEffect } from 'react';
import SchoolIcons from '../school/SchoolIcons';
import useSketch from '@/hooks/useSketch';
import SchoolStory from './components/SchoolStory';
import SchoollRenderer from './components/SchoolRenderer';

export default function SchoolDesc() {
  const images = [
    '/img/astrark/school/bg_genetic.jpg',
    '/img/astrark/school/bg_mechanoid.jpg',
    '/img/astrark/school/bg_spiritual.jpg',
    '/img/astrark/school/bg_natural.jpg',
  ];
  const { nodeRef, sketch, activeIndex, isTouchedBottom, switchSketch, onSwiperInit, onSlideChange } =
    useSketch<HTMLDivElement>(images);

  function onIconClick(index: number) {
    if (index === activeIndex || sketch.current?.isRunning) return;
    switchSketch(index);
  }

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = 'unset';
    };
  }, []);

  return (
    <section className="school-desc w-full h-screen relative overflow-hidden">
      <div ref={nodeRef} className="w-full h-full"></div>

      <SchoollRenderer
        count={4}
        mousewheel={!sketch.current?.isRunning && { releaseOnEdges: true, thresholdTime: 1200 }}
        onSwiperInit={onSwiperInit}
        onActiveIndexChange={onSlideChange}
      />

      {isTouchedBottom || <div className="absolute left-0 top-0 w-full h-screen overflow-hidden z-20"></div>}

      <SchoolStory activeIndex={activeIndex} />

      <SchoolIcons
        className="absolute left-1/2 bottom-12 -translate-x-1/2 z-20"
        hoverActive
        cursorPointer
        activeIndex={activeIndex}
        onClick={onIconClick}
      />
    </section>
  );
}
