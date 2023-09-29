import PageDesc from "../common/PageDesc";

export default function IndexSlide() {
  return (
    <div className="bg-video w-full h-screen relative flex justify-center items-center">
      <video
        className="w-full h-full object-cover absolute inset-100"
        src="/video/ntfbg.webm"
        autoPlay
        muted
        loop
      ></video>

      <PageDesc
        title="800 Exclusive<br>Destiny TETRA NFTs Awaits"
        subtitle="Get ready for the Moonveil Destiny TETRA NFT Free Mint Event beginning on October 1st!<br>Click to join our whitelist tasks and secure your spot now."
        buttonLabel="click to explore"
        buttonLink="/comingsoon"
      />
    </div>
  );
}
