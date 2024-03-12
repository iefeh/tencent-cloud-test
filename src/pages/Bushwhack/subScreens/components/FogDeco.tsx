import Image from 'next/image';
import leftFogImg from 'img/bushwhack/content/fog_left.png';
import rightFogImg from 'img/bushwhack/content/fog_right.png';

export default function FogDeco() {
  return (
    <>
      <Image
        className="w-[57.875rem] h-[50rem] object-cover absolute left-0 top-[calc(100vh_-_17rem)] z-50 pointer-events-none"
        src={leftFogImg}
        alt=""
      />

      <Image
        className="w-[68.125rem] h-[50rem] object-cover absolute right-0 top-[calc(100vh_-_26.5625rem)] z-50 pointer-events-none"
        src={rightFogImg}
        alt=""
      />

      <div className="absolute left-0 top-[100vh] w-screen h-screen z-50 pointer-events-none">
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
    </>
  );
}
