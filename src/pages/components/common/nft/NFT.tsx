import Image, { StaticImageData } from 'next/image';
import bgImg from 'img/nft/common/bg_nft.png';
import activeBgImg from 'img/nft/common/bg_nft_active.png';
import emptyNFTImg from 'img/nft/common/nft_empty.jpg';

interface NFTProps {
  src?: string | StaticImageData;
}

export default function NFT(props: NFTProps) {
  const { src } = props;

  return (
    <div className="flex flex-col items-center shrink-0">
      <div className="relative w-[16.5rem] h-[16.5rem] flex justify-center items-center bg-black">
        <Image src={src ? activeBgImg : bgImg} alt="" fill />

        <Image className="relative z-0 w-[13.125rem] h-[13.125rem]" src={src || emptyNFTImg} alt="" />
      </div>
    </div>
  );
}
