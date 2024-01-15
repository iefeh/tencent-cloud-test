import { useEffect, useRef } from 'react';
import SchoolIcons from '../school/SchoolIcons';
import useSketch from '@/hooks/useSketch';
import SchoolStory from './components/SchoolStory';
import SchoolSwiper from './components/SchoolSwiper';
import schools from './schools.json';
import { cn } from '@nextui-org/react';
import { SwiperClass } from 'swiper/react';

export default function SchoolDesc() {
  const images = [
    '/img/astrark/school/genetic.jpg',
    '/img/astrark/school/mechanoid.jpg',
    '/img/astrark/school/spiritual.jpg',
    '/img/astrark/school/natural.jpg',
  ];
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(Array(schools.length).fill(null));
  const { nodeRef, sketch, activeIndex, isTouchedBottom, isAniRunning, switchSketch, onSwiperInit, onSlideChange } =
    useSketch<HTMLDivElement>(images, onBeforeSketch, onAfterSketch);

  function onIconClick(index: number) {
    if (index === activeIndex || sketch.current?.isRunning) return;
    switchSketch(index);
  }

  async function onBeforeSketch(prevIndex: number, nextIndex: number) {
    const { offsetWidth: ow, offsetHeight: oh } = nodeRef.current!;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = ow;
    canvas.height = oh;

    const node = videoRefs.current[prevIndex];
    if (!node) return;

    const { videoWidth: vw, videoHeight: vh } = node;
    node.pause();

    ctx.clearRect(0, 0, ow, oh);
    ctx.drawImage(node, (vw - ow) / 2, (vh - oh) / 2, ow, oh, 0, 0, ow, oh);
    const url = canvas.toDataURL();
    await sketch.current?.updateImage(prevIndex, url);
  }

  function onAfterSketch(prevIndex: number, nextIndex: number) {
    startPlay(nextIndex);
    sketch.current?.updateImage(prevIndex, images[prevIndex]);
  }

  async function onSwiperSlideChange(swiper: SwiperClass) {
    if (isAniRunning) return;
    onSlideChange(swiper);
  }

  function startPlay(index: number) {
    const node = videoRefs.current[index];
    if (!node) return;

    node.pause();
    node.currentTime = 2;
    node.play();
  }

  useEffect(() => {}, []);

  return (
    <section className="school-desc w-full h-screen relative overflow-hidden">
      <div className="w-full h-full relative">
        {schools.map((school, index) => (
          <video
            key={index}
            ref={(ref) => (videoRefs.current[index] = ref)}
            className={cn(['object-cover w-full h-full', index === activeIndex ? 'block' : 'hidden'])}
            playsInline
            muted
            loop
            preload="auto"
            crossOrigin="anonymous"
            poster=""
          >
            <source src={school.video}></source>
          </video>
        ))}

        <div
          ref={nodeRef}
          className={cn(['absolute inset-0 w-full h-full', isAniRunning ? 'visible' : 'invisible'])}
        ></div>
      </div>

      <SchoolSwiper
        count={4}
        mousewheel={!sketch.current?.isRunning && { releaseOnEdges: true, thresholdTime: 1200 }}
        onSwiperInit={onSwiperInit}
        onActiveIndexChange={onSwiperSlideChange}
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
