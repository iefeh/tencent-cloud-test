import Image from 'next/image';
import PageDesc from '../common/PageDesc';

interface Props {
  needAni?: boolean;
}

export default function RaceSlide(props: Props) {
  return (
    <div className="bg-race w-full h-screen relative flex justify-center items-center">
      <Image className="object-cover" src="/img/bg_home_swiper_race.png" alt="" fill sizes="100%"></Image>

      <div className="absolute left-0 top-0 w-full h-full bg-black/40"></div>

      <PageDesc
        whiteLogo
        hasBelt
        needAni={props.needAni}
        title="See You In Q4 2023"
        subtitle="Real time tower-defense strategy game"
      />
    </div>
  );
}
