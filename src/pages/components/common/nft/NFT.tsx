import Image from 'next/image';
import bgImg from 'img/nft/common/bg_nft.png';
import activeBgImg from 'img/nft/common/bg_nft_active.png';
import emptyNFTImg from 'img/nft/common/nft_empty.jpg';
import Video from '../Video';
import pendingImg from 'img/profile/pending.png';
import transferringImg from 'img/profile/transferring.png';
import selectedIcon from 'img/nft/merge/icon_selected.png';
import { useState } from 'react';
import { throttle } from 'lodash';

interface NFTProps {
  className?: string;
  name?: string;
  src?: string;
  isPending?: boolean;
  isTransferring?: boolean;
  showSelection?: boolean;
  defaultSelected?: boolean;
  onClick?: (item?: any) => void;
  onSelectChange?: (selected: boolean) => void;
}

export default function NFT(props: NFTProps) {
  const { name, src, isPending, isTransferring, showSelection, defaultSelected, onClick, onSelectChange } = props;
  const [selected, setSelected] = useState(!!defaultSelected);

  const onNFTClick = throttle(async () => {
    if (onClick) {
      onClick();
    }

    if (onSelectChange) {
      setSelected(!selected);
      onSelectChange(!selected);
    }
  }, 500);

  return (
    <div className="flex flex-col items-center shrink-0 relative" onClick={onNFTClick}>
      <div className="relative w-[16.5rem] h-[16.5rem] flex justify-center items-center bg-black">
        <Image src={src ? activeBgImg : bgImg} alt="" fill />

        {src ? (
          <div className="relative z-0 w-[13.125rem] h-[13.125rem]">
            <Video
              options={{
                sources: [
                  {
                    src,
                    type: 'video/webm',
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

            {isTransferring && (
              <Image
                className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[13.9375rem] h-[7.4375rem]"
                src={transferringImg}
                alt=""
              />
            )}
          </div>
        ) : (
          <Image className="relative z-0 w-[13.125rem] h-[13.125rem]" src={emptyNFTImg} alt="" />
        )}
      </div>

      {showSelection && selected && (
        <Image className="absolute right-4 top-4 w-7 h-7" src={selectedIcon} alt="" width={56} height={56} />
      )}

      {name && (
        <div className="font-poppins text-base mt-3 max-w-full text-center overflow-hidden text-ellipsis whitespace-nowrap">
          {name}
        </div>
      )}
    </div>
  );
}
