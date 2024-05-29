import useFrameAni from '@/hooks/useFrameAni';
import { FC } from 'react';

const PlanetAni: FC = () => {
  const { canvasRef } = useFrameAni({
    width: 1920,
    height: 1076,
    url: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/planet_ani.zip',
    cover: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/planet_ani_cover.png',
    count: 288,
    nameFn: (i) => `planet_${i.toString().padStart(5, '0')}.png`,
  });

  return (
    <div className="w-full h-full flex justify-center items-center">
      <canvas ref={canvasRef} className="object-contain"></canvas>

      <div className="absolute inset-0">
        <div></div>
      </div>
    </div>
  );
};

export default PlanetAni;
