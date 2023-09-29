import PageDesc from "../common/PageDesc";

export default function IndexSlide() {
  return (
    <div className="bg-video w-full h-screen relative flex justify-center items-center">
      <div className="video-container absolute inset-0">
        <video
          className="w-full h-full object-cover"
          src="/video/ntfbg.webm"
          autoPlay
          muted
          loop
        ></video>

        <div className="video-mask absolute inset-0 z-10 bg-black/70"></div>
      </div>

      <PageDesc
        hasBelt
        title="800 Exclusive<br>Destiny TETRA NFTs Awaits"
        subtitle="Get ready for the Moonveil Destiny TETRA NFT Free Mint Event beginning on October 1st!<br>Click to join our whitelist tasks and secure your spot now."
        buttonLabel="click to explore"
        buttonLink="/comingsoon"
      />
    </div>
  );
}
