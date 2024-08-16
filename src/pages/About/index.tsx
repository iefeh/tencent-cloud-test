'use client';
import { useEffect, useState } from 'react';
import Video from '../components/common/Video';
import { cn } from '@nextui-org/react';
import S3Image from '@/components/common/medias/S3Image';

export default function About() {
  const [isWidthMore, setIsWidthMore] = useState(true);

  function onResize() {
    const { innerWidth, innerHeight } = window;
    // 1920 / 1080
    setIsWidthMore(innerWidth / innerHeight > 1.78);
  }

  useEffect(() => {
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className={cn(['aspect-[1920/1080] relative', isWidthMore ? 'h-full' : 'w-full'])}>
        <Video
          className="w-full h-full"
          options={{
            controls: false,
            bigPlayButton: false,
            sources: [
              {
                src: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/ECOSYSTEM+LOOP.webm',
                type: 'video/webm',
              },
            ],
          }}
        />

        <S3Image className='' src="/about/ecoanimations/nebula_lb.png" alt='' sizes='auto' />
      </div>
    </div>
  );
}
