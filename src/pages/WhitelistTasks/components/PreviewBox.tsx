import Image from 'next/image';
import borderImg from 'img/nft/whitelist/video_border.png';
import bgImg from 'img/nft/whitelist/video_bg.jpg';

export default function PreviewBox() {
  return (
    <div className="fixed w-[36.46vw] h-screen left-0 top-0 z-0 flex items-center overflow-hidden">
      <Image
        className="max-w-[unset] w-[132%] object-contain absolute left-[calc(19.43%_+_13.125rem)] top-[55%] -translate-x-1/2 -translate-y-1/2"
        src={bgImg}
        alt=""
      />

      <div className="video relative overflow-hidden ml-[19.43%]">
        <Image className="w-[26.25vw] object-contain relative z-0" src={borderImg} alt="" />

        <video
          className="object-cover w-[95.24%] h-[95.24%] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
          poster="/img/nft/whitelist/cover.jpg"
        >
          <source src="/video/NFT.mp4" />
        </video>
      </div>
    </div>
  );
}
