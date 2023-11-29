import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import badgesImg from 'img/loyalty/intro/badges.png';

export default function BadgeScreen() {
  return (
    <div className="w-full h-screen flex justify-center items-center relative">
      <div className="flex justify-center gap-[5.625rem] w-auto">
        <PageDesc
          hasBelt
          className="text-left max-w-[36rem] mt-[6rem]"
          title="Moonveil Badge System"
          subtitle="In collaboration with Moon Beams, we proudly present the Moonveil Badge System as part of our Loyalty Program. A diverse range of badges has been meticulously crafted to track and reward player engagement. These badges not only commemorate players' achievements but also unlock additional exclusive perks, including MBs and exciting bonuses yet to be revealed."
        />

        <div>
          <Image className="w-[45.3125rem] h-[40rem]" src={badgesImg} alt="" />
        </div>
      </div>
    </div>
  );
}
