import Image from 'next/image';
import PageDesc from '../common/PageDesc';

interface Props {
  needAni?: boolean;
}

export default function BadgeSlide(props: Props) {
  return (
    <div className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12">
      <Image className="object-cover" src="/img/bg_home_swiper_badge.png" alt="" fill sizes="100%" />

      <div className="absolute left-0 top-0 w-full h-full bg-black/40"></div>

      <PageDesc
        hasBelt
        title="Unlock Achievements, Reap Rewards<br />The Moonveil Badge System Unveiled!"
        needAni={props.needAni}
        baseAniTY
        className="relative top-[5%] left-[10%] items-start text-center w-full"
        subtitle={
          <div className="title text-lg font-decima mb-10 tracking-tighter max-w-[40rem] text-left">
            We are thrilled to introduce the Moonveil Badge System as an integral component of our Loyalty Program.
            Complete tasks and claim your exclusive badges now! .
          </div>
        }
        buttonLabel="Explore Now"
        buttonLink="/Profile/MyBadges"
      />
    </div>
  );
}
