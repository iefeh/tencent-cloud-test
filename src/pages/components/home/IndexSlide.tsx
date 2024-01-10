import PageDesc from "../common/PageDesc";

interface Props {
  needAni?: boolean;
}

export default function IndexSlide(props: Props) {
  return (
    <div className="bg-video w-full h-screen relative flex justify-center items-center">
      <div className="video-container absolute inset-0 z-0">
        <video
          className="w-full h-full block object-cover"
          src="/video/ntfbg.webm"
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
        className="relative top-[15%] lg:top-[20%] items-center text-center"
        title="Moonveil’s Exclusive Free Mint<br />Genesis Collection — Destiny TETRA NFT"
        subtitle="The whitelist journey of Moonveil’s Genesis NFT, Destiny TETRA NFT<br />will officially commence on January 10th."
        buttonLabel="click to explore"
        buttonLink="/NFT"
      />
    </div>
  );
}
