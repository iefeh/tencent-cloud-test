import useFrameAni from '@/hooks/useFrameAni';
import { cn } from '@nextui-org/react';
import { FC, useEffect } from 'react';

interface Props {
  visible?: boolean;
  onFinished?: () => void;
}

const DrawAni: FC<Props> = ({ visible, onFinished }) => {
  const { canvasRef, startAni } = useFrameAni({
    width: 1280,
    height: 1920,
    count: 23,
    url: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/reward_ani.zip',
    fit: 'cover',
    frames: 18,
    infinite: false,
    onFinished,
    nameFn: (i) => `reward_${(i + 1).toString().padStart(5, '0')}_1.png`,
  });

  useEffect(() => {
    if (!visible) return;
    startAni();
  }, [visible]);

  return (
    <div className={cn(['flex justify-center items-center absolute inset-0 z-0', visible || 'invisible'])}>
      <canvas ref={canvasRef} className="object-contain"></canvas>
    </div>
  );
};

export default DrawAni;
