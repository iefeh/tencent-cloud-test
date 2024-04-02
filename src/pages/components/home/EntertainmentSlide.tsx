import Image from 'next/image';
import PageDesc from '../common/PageDesc';

interface Props {
  needAni?: boolean;
}

export default function EntertainmentSlide(props: Props) {
  return (
    <div className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12">
      <Image className="object-cover" src="/img/bg_home_swiper_entertainment.png" alt="" fill sizes="100%"></Image>

      <div className="absolute left-0 top-0 w-full h-full bg-black/40"></div>

      <PageDesc
        goldenLogo
        hasBelt
        title={<div className='title text-6xl uppercase font-semakin mb-4 max-md:text-5xl'>Moonveil Entertainment</div>}
        needAni={props.needAni}
        baseAniTY
        className="relative top-[5%] items-center text-center w-full"
        subtitle={<div className='title text-lg font-decima mb-10 tracking-tighter max-w-[40rem]'>With the power of cutting-edge technologies, our mission is to craft top-notch gaming experiences that seamlessly combine casual flexibility with authentic fun depth.</div>}
      />
    </div>
  );
}
