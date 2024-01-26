import Image from 'next/image';
import bgImg from 'img/nft/common/bg_nft.png';
import activeBgImg from 'img/nft/common/bg_nft_active.png';
import emptyNFTImg from 'img/nft/common/nft_empty.jpg';
import Video from '../Video';
import pendingImg from 'img/profile/pending.png';

interface NFTProps {
  className?: string;
  src?: string;
  isPending?: boolean;
}

export default function NFT(props: NFTProps) {
  const { src, isPending } = props;

  return (
    <div className="flex flex-col items-center shrink-0">
      <div className="relative w-[16.5rem] h-[16.5rem] flex justify-center items-center bg-black">
        <Image src={src ? activeBgImg : bgImg} alt="" fill />

        {src ? (
          <div className="relative z-0 w-[13.125rem] h-[13.125rem]">
            <Video
              options={{
                sources: [
                  src
                    ? {
                        src,
                        type: 'video/webm',
                      }
                    : {
                        src: '/video/NFT.mp4',
                        type: 'video/mp4',
                      },
                ],
              }}
            />

            {isPending && (
              <Image
                className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[9.625rem] h-24"
                src={pendingImg}
                alt=""
              />
            )}
          </div>
        ) : (
          <Image className="relative z-0 w-[13.125rem] h-[13.125rem]" src={emptyNFTImg} alt="" />
        )}
      </div>
    </div>
  );
}
