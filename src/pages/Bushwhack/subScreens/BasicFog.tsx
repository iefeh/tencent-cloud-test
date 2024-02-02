import Image from 'next/image';
import fogImg from 'img/bushwhack/fog/fog.jpg';
import leftFogImg from 'img/bushwhack/content/fog_left.png';
import rightFogImg from 'img/bushwhack/content/fog_right.png';
import FogMainContent from './components/FogMainContent';
import useTouchBottom from '@/hooks/useTouchBottom';

export default function SuperFogScreen() {
  const { isTouchedBottom } = useTouchBottom();

  return (
    <div className="w-screen h-screen relative select-none flex justify-center items-center bg-no-repeat bg-center bg-[length:100%_100%] bg-[url('/img/bushwhack/fog/fog.jpg')]">
      {isTouchedBottom ? <FogMainContent /> : <Image className="pointer-events-none z-20" src={fogImg} alt="" fill />}

      <div className="absolute top-0 left-1/2 h-full w-[calc(100%_+_4rem)] -translate-x-1/2 z-40 overflow-hidden pointer-events-none shadow-[0_0_2rem_2em_#000_inset]"></div>

      <Image
        className="w-[57.875rem] h-[50rem] object-cover absolute left-0 -top-[17rem] z-40 pointer-events-none"
        src={leftFogImg}
        alt=""
      />

      <Image
        className="w-[68.125rem] h-[50rem] object-cover absolute right-0 -top-[26.5625rem] z-40 pointer-events-none"
        src={rightFogImg}
        alt=""
      />

      <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none">
        <Image
          className="w-[57.875rem] h-[50rem] object-cover absolute left-0 -bottom-[33rem] z-0 pointer-events-none"
          src={leftFogImg}
          alt=""
        />

        <Image
          className="w-[68.125rem] h-[50rem] object-cover absolute right-0 -bottom-[23.4375rem] z-0 pointer-events-none"
          src={rightFogImg}
          alt=""
        />
      </div>

      {isTouchedBottom || <div className="absolute inset-0 z-50"></div>}
    </div>
  );
}
