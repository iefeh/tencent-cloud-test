import { useEffect, useRef } from 'react';
import SchoolIcons from '../school/SchoolIcons';
import useSketch from '@/hooks/useSketch';
import SchoolStory from './components/SchoolStory';
import SchoolSwiper from './components/SchoolSwiper';
import schools from './schools.json';
import { cn } from '@nextui-org/react';

export default function SchoolDesc() {
  const COUNT = 4;
  const images = Array(COUNT).fill('');
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(Array(schools.length).fill(null));
  const {
    nodeRef,
    sketch,
    activeIndex,
    isTouchedBottom,
    isAniRunning,
    updateImages,
    switchSketch,
    onSwiperInit,
    onSlideChange,
  } = useSketch<HTMLDivElement>(images, onBeforeSketch, onAfterSketch);

  function onIconClick(index: number) {
    if (index === activeIndex || sketch.current?.isRunning) return;
    switchSketch(index);
  }

  function getFrame(index: number, isFirst = false) {
    const { clientWidth: ow, clientHeight: oh } = nodeRef.current!;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = ow;
    canvas.height = oh;

    const node = videoRefs.current[index];
    if (!node) return;

    const { videoWidth: vw, videoHeight: vh } = node;
    node.pause();

    if (isFirst) node.currentTime = 2;

    ctx.clearRect(0, 0, ow, oh);
    ctx.drawImage(node, (vw - ow) / 2, (vh - oh) / 2, ow, oh, 0, 0, ow, oh);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        try {
          const url = URL.createObjectURL(blob!);
          await sketch.current?.updateImage(index, url);
          images[index] = url;
          resolve(url);
        } catch (error) {
          resolve('');
        }
      });
    });
  }

  function onBeforeSketch(prevIndex: number, nextIndex: number) {
    return Promise.all([getFrame(prevIndex), getFrame(nextIndex, true)]);
  }

  function onAfterSketch(prevIndex: number, nextIndex: number) {
    startPlay(nextIndex);
    sketch.current?.updateImage(prevIndex, images[prevIndex]);
  }

  async function startPlay(index: number) {
    const node = videoRefs.current[index];
    if (!node) return;

    node.pause();
    node.currentTime = 2;
    try {
      await node.play();
    } catch (error) {
      console.log('play video', error);
    }
  }

  useEffect(() => {
    Promise.all(images.map((item, index) => getFrame(index, true)))
      .then(async (urls) => {
        updateImages(urls as string[]);
      })
      .finally(() => {
        startPlay(activeIndex);
      });
  }, []);

  return (
    <section className="school-desc w-full h-screen relative overflow-hidden hidden md:block">
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
          className={cn(['absolute inset-0 w-full h-full z-0', isAniRunning ? 'visible' : 'invisible'])}
        ></div>
      </div>

      <SchoolSwiper
        count={COUNT}
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
