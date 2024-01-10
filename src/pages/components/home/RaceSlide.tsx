import Image from 'next/image';
import PageDesc from '../common/PageDesc';

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
        title="Alpha Test Coming Soon"
        subtitle="An immersive tower defense strategy game."
      />
    </div>
  );
}
