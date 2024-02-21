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
  const firstImages = Array(COUNT).fill('');
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

  async function getFrame(index: number, isFirst = false) {
    if (isFirst && firstImages[index]) {
      await sketch.current?.updateImage(index, firstImages[index]);
      images[index] = firstImages[index];
      return;
    }

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
    const rw = vw / ow;
    const rh = vh / oh;
    const ratio = ow > vw || oh > vh ? Math.max(rw, rh) : Math.min(rw, rh);
    const realW = ow * ratio;
    const realH = oh * ratio;
    console.log(ow, oh, realW, realH);
    ctx.drawImage(node, Math.abs((realW - vw) / 2), Math.abs((realH - vh) / 2), realW, realH, 0, 0, ow, oh);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((res) => resolve(res)));
    if (!blob) return '';

    let url = '';

    try {
      url = URL.createObjectURL(blob);
    } catch (error) {}

    await sketch.current?.updateImage(index, url);
    images[index] = url;
    if (isFirst) firstImages[index] = url;
    return url;
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
