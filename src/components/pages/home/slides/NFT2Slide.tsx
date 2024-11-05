import PageDesc from '@/components/common/PageDesc';
import { HomeSlide } from '@/types/lottery';
import { FC } from 'react';

interface Props {
  needAni?: boolean;
}

const NFT2Slide: FC & HomeSlide = (props: Props) => {
  return (
    <div className="bg-video w-full h-screen relative flex justify-center items-center">
      <div className="video-container absolute inset-0 z-0">
        <video
          className="w-full h-full block object-cover"
          src="https://d3dhz6pjw7pz9d.cloudfront.net/nft/nftbg2.webm"
          autoPlay
          muted
          loop
        ></video>

        <div className="video-mask absolute left-0 top-0 w-full h-full z-10 bg-black/70"></div>
      </div>

      <PageDesc
        hasBelt
        needAni={props.needAni}
        baseAniTY
        className="relative top-[15%] lg:top-[20%] items-center text-center px-8"
        title="Combine your Destiny TETRAs<br />4-to-1, and Acquire Your Eternity TETRA"
        subtitle="Owning an Eternity TETRA NFT unlocks a broader range of exclusive benefits within the Moonveil ecosystem."
        buttonLabel="Explore Now"
        buttonLink="https://opensea.io/collection/eternity-tetra"
      />
    </div>
  );
};

NFT2Slide.hasVideo = true;

export default NFT2Slide;
