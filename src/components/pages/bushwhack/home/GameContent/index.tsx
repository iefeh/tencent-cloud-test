import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import videoImg from 'img/bushwhack/content/video.jpg';
import Video from '@/pages/components/common/Video';

export default function GameContent() {
  return (
    <div className="w-full relative z-30 shadow-[0_0_2rem_2rem_#000]">
      <Image className="object-cover" src="/img/bushwhack/content/bg.jpg" alt="" fill />

      <div className="max-w-full px-16 lg:px-0 lg:max-w-[75rem] m-auto flex flex-col pt-16 lg:pt-[26.625rem] pb-[13.625rem] relative z-0">
        <PageDesc
          hasBelt
          className="items-start text-left"
          title={
            <div className="font-semakin text-6xl" style={{ textShadow: '0 0 2rem #3C6EFF' }}>
              BUSHWHACK
              <br />
              ——STEALTH BATTLE ROYALE
            </div>
          }
          subtitle={
            <div className="text-lg font-decima tracking-tighter mt-10">
              Step into our mysterious, mist-covered battlefield! Players engage in a fierce battle, and only the last
              one standing emerges victorious. Survival demands mastering the art of stealth – hide in the mist, waiting
              for the perfect moment to ambush opponents. Collect resources, upgrade gear, and be ready to escape danger
              circles tightening the battlefield. BUSHWHACK will also collaborate with renowned brands or NFTs in future
              events. Stay tuned for more updates
            </div>
          }
        />

        <Video
          className="w-full h-auto mt-20"
          options={{
            autoplay: true,
            sources: [
              {
                src: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/bushwhack/background/teaser.mp4',
                type: 'video/webm',
              },
            ],
          }}
        />

        <PageDesc
          className="items-start text-left mt-14"
          title={
            <div className="font-semakin text-6xl" style={{ textShadow: '0 0 2rem #3C6EFF' }}>
              Game testing
            </div>
          }
          subtitle={
            <div className="text-lg font-decima tracking-tighter mt-12">
              Step into our mysterious, mist-covered battlefield! Players engage in a fierce battle, and only the last
              one standing emerges victorious. Survival demands mastering the art of stealth – hide in the mist, waiting
              for the perfect moment to ambush opponents. Collect resources, upgrade gear, and be ready to escape danger
              circles tightening the battlefield.
            </div>
          }
        />
      </div>
    </div>
  );
}
