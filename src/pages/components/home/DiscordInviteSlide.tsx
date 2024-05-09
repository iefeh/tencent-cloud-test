import Image from 'next/image';

interface Props {
  needAni?: boolean;
}

export default function DiscordInviteSlide(props: Props) {
  function onClick() {
    window.open('https://discord.com/invite/moonveil');
  }

  return (
    <div
      className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12 cursor-pointer"
      onClick={onClick}
    >
      <Image
        className="object-cover"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/home/bg_home_swiper_discord_invite.png"
        alt=""
        fill
        unoptimized
      />
    </div>
  );
}
