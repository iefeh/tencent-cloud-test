import Image from 'next/image';
import fogImg from 'img/bushwhack/fog/fog.jpg';
import FogMainContent from './components/FogMainContent';
import useTouchBottom from '@/hooks/useTouchBottom';

export default function FogScreen() {
  const { isTouchedBottom } = useTouchBottom();

  return (
    <div className="w-screen h-screen relative select-none flex justify-center items-center bg-no-repeat bg-center bg-[length:100%_100%] bg-[url('/img/bushwhack/fog/fog.jpg')] overflow-hidden">
      {isTouchedBottom ? <FogMainContent /> : <Image className="pointer-events-none z-20" src={fogImg} alt="" fill />}

      {isTouchedBottom || <div className="absolute inset-0 z-50"></div>}
    </div>
  );
}
