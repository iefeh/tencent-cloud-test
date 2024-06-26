import Image from 'next/image';
import PageDesc from '@/components/common/PageDesc';

interface Props {
  needAni?: boolean;
}

export default function RaceSlide(props: Props) {
  return (
    <div className="bg-race w-full h-screen relative flex justify-center items-center">
      <Image className="object-cover" src="/img/bg_home_swiper_race.jpg" alt="" fill sizes="100%"></Image>

      <div className="absolute left-0 top-0 w-full h-full bg-black/40"></div>

      <PageDesc
        whiteLogo
        hasBelt
        needAni={props.needAni}
        baseAniTY
        title="AstrArk: Stage One"
        subtitle="An Immersive Tower Defense Strategy Game"
        buttonLabel="Join Now"
        buttonLink="/AstrArk/PreRegistration"
      />
    </div>
  );
}
