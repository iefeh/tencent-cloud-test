import S3Image from '@/components/common/medias/S3Image';

interface Props {
  needAni?: boolean;
}

export default function TestnetSlide(props: Props) {
  function onExplore() {
    window.open(process.env.NEXT_PUBLIC_URL_MV_FAUCET);
  }

  return (
    <div
      className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12 cursor-pointer"
      onClick={onExplore}
    >
      <S3Image className="object-cover" src="/home/bg_home_swiper_testnet.png" fill />
    </div>
  );
}
