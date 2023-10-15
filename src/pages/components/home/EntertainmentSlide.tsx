import Image from 'next/image';
import PageDesc from '../common/PageDesc';

interface Props {
  needAni?: boolean;
}

export default function EntertainmentSlide(props: Props) {
  return (
    <div className="bg-race w-full h-screen relative flex justify-center items-center">
      <Image className="object-cover" src="/img/bg_home_swiper_entertainment.png" alt="" fill sizes="100%"></Image>

      <div className="absolute left-0 top-0 w-full h-full bg-black/40"></div>

      <PageDesc
        goldenLogo
        hasBelt
        title="Moonveil Entertainment"
        needAni={props.needAni}
        baseAniTY
        className="relative top-[5%] items-center text-center"
        subtitle="With the power of cutting-edge technologies, our mission is to<br>craft top-notch gaming experiences that seamlessly combine casual<br>flexibility with authentic fun depth."
      />
    </div>
  );
}
