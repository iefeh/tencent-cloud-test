import Image from 'next/image';
import bgImg from 'img/nft/common/bg_nft.png';
import activeBgImg from 'img/nft/common/bg_nft_active.png';
import selectedBgImg from 'img/nft/merge/bg_nft_actived.png';
import emptyNFTImg from 'img/nft/merge/bg_nft_inactived.png';
import Video from '../Video';
import pendingImg from 'img/profile/pending.png';
import transferringImg from 'img/profile/transferring.png';
import selectedIcon from 'img/nft/merge/icon_selected.png';
import { useMemo, useState } from 'react';
import { throttle } from 'lodash';
import { cn } from '@nextui-org/react';

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

export default function MergeNFT(props: NFTProps) {
  const { name, src, isPending, isTransferring, showSelection, defaultSelected, onClick, onSelectChange } = props;
  const [selected, setSelected] = useState(!!defaultSelected);

  const onNFTClick = throttle(async () => {
    if (onClick) {
      onClick();
    }

    if (onSelectChange && src) {
      setSelected(!selected);
      onSelectChange(!selected);
    }
  }, 500);

  const MemoVideo = useMemo(
    () =>
      src ? (
        <div className="relative z-0 w-[13.125rem] h-[13.125rem]">
          <Video
            options={{
              controls: false,
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
