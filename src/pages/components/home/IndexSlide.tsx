import PageDesc from '../common/PageDesc';

interface Props {
  needAni?: boolean;
}

export default function IndexSlide(props: Props) {
  return (
    <div className="bg-video w-full h-screen relative flex justify-center items-center">
      <div className="video-container absolute inset-0 z-0">
        <video className="w-full h-full block object-cover" src="/video/ntfbg.webm" autoPlay muted loop></video>

        <div className="video-mask absolute left-0 top-0 w-full h-full z-10 bg-black/70"></div>
      </div>

      <PageDesc
        hasBelt
        needAni={props.needAni}
        baseAniTY
        className="relative top-[15%] lg:top-[20%] items-center text-center px-8"
        title="Moonveil's Genesis NFT<br />The Destiny TETRA"
        subtitle="The Destiny TETRA NFT is the first level of Moonveil's Genesis NFT collection.<br />The first-ever release promises to be the most valuable and sought-after NFT collection in Moonveil’s ecosystem."
        buttonLabel="Explore Now"
        buttonLink="https://opensea.io/collection/destiny-tetra"
      />
    </div>
  );
}
