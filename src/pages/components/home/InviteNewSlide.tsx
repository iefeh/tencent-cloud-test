import Image from 'next/image';
import PageDesc from '../common/PageDesc';

interface Props {
  needAni?: boolean;
}

export default function InviteNewSlide(props: Props) {
  return (
    <div className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12">
      <Image className="object-cover" src="/img/bg_home_swiper_invite.png" alt="" fill sizes="100%"></Image>

      <div className="absolute left-0 top-0 w-full h-full bg-black/40"></div>

      <PageDesc
        hasBelt
        title="Invite New Users<br />to Join Moonveil Ecosystem"
        needAni={props.needAni}
        baseAniTY
        className="relative top-[5%] left-[10%]  items-start text-left w-full"
        subtitle={<div className='title text-lg font-decima mb-10 tracking-tighter max-w-[40rem]'>Engage and earn! Get continuous Moon Beams rewards for your participation. Invite friends and they&apos;ll receive a 15 Moon Beams bonus!</div>}
        buttonLabel="Invite Now"
        buttonLink="/Profile/invite"
        needAuth
      />
    </div>
  );
}
