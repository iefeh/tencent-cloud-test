import Image, { StaticImageData } from 'next/image';
import bgImg from 'img/nft/common/bg_nft.png';
import activeBgImg from 'img/nft/common/bg_nft_active.png';
import selectedBgImg from 'img/nft/merge/bg_nft_actived.png';
import emptyNFTImg from 'img/nft/merge/bg_nft_inactived.png';
import Video from '../Video';
import pendingImg from 'img/profile/pending.png';
import transferringImg from 'img/profile/transferring.png';
import burningImg from 'img/profile/burning.png';
import selectedIcon from 'img/nft/merge/icon_selected.png';
import { useMemo, useState } from 'react';
import { throttle } from 'lodash';
import { cn } from '@nextui-org/react';

interface NFTProps {
  className?: string;
  name?: string;
  src?: string;
  status?: string;
  showSelection?: boolean;
  defaultSelected?: boolean;
  onClick?: (item?: any) => void;
  onSelectChange?: (selected: boolean) => boolean | undefined;
}

export default function MergeNFT(props: NFTProps) {
  const { name, src, status, showSelection, defaultSelected, onClick, onSelectChange } = props;
  const [selected, setSelected] = useState(!!defaultSelected);
  const isPending = status === 'pending';
  const isTransferring = status === 'pending';
  const isBurning = status === 'burning';

  let statusImg: StaticImageData | null = null;

  if (isPending) {
    statusImg = pendingImg;
  } else if (isTransferring) {
    statusImg = transferringImg;
  } else if (isBurning) {
    statusImg = burningImg;
  }

  const onNFTClick = throttle(async () => {
    if (onClick) {
      onClick();
    }

    if (onSelectChange && src && !isPending && !isTransferring) {
      if (onSelectChange(!selected)) {
        setSelected(!selected);
      }
    }
  }, 500);

  const MemoVideo = useMemo(
    () =>
      src ? (
        <div className="relative z-0 w-[13.125rem] h-[13.125rem]">
          <Video
            options={{
              preload: false,
              autoplay: false,
              controls: false,
              sources: [
                {
                  src,
                  type: 'video/webm',
                },
              ],
            }}
          />

          {statusImg && (
            <Image
              className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[9.625rem] h-24"
              src={statusImg}
              alt=""
            />
          )}
        </div>
      ) : (
        <Image className="relative z-0 w-[13.125rem] h-[13.125rem]" src={emptyNFTImg} alt="" />
      ),
    [src],
  );

  return (
    <div className="flex flex-col items-center shrink-0 relative" onClick={onNFTClick}>
      <div className="relative w-[16.5rem] h-[16.5rem] flex justify-center items-center bg-black">
        <Image src={src ? (selected ? selectedBgImg : activeBgImg) : bgImg} alt="" fill />

        {MemoVideo}
      </div>

      <Image
        className={cn([
          'absolute right-6 top-5 w-7 h-7 transition-opacity',
          showSelection && selected ? 'opacity-100' : 'opacity-0',
        ])}
        src={selectedIcon}
        alt=""
        width={56}
        height={56}
      />

      {name && (
        <div className="font-poppins text-base mt-3 max-w-full text-center overflow-hidden text-ellipsis whitespace-nowrap">
          {name}
        </div>
      )}
    </div>
  );
}
