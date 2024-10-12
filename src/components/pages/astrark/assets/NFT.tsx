import Image, { StaticImageData } from 'next/image';
import bgImg from 'img/nft/common/bg_nft.png';
import activeBgImg from 'img/nft/common/bg_nft_active.png';
import emptyNFTImg from 'img/nft/common/nft_empty.jpg';
import Video from '@/pages/components/common/Video';
import pendingImg from 'img/profile/pending.png';
import transferringImg from 'img/profile/transferring.png';
import burningImg from 'img/profile/burning.png';
import selectedIcon from 'img/nft/merge/icon_selected.png';
import { useState } from 'react';
import { throttle } from 'lodash';
import { cn } from '@nextui-org/react';

interface NFTProps {
  nftClassName?: string;
  className?: string;
  name?: string;
  src?: string;
  isSrcImage?: boolean;
  hideBorder?: boolean;
  status?: string;
  transactionStatus?: string;
  withControls?: boolean;
  showSelection?: boolean;
  defaultSelected?: boolean;
  onClick?: (item?: any) => void;
  onSelectChange?: (selected: boolean) => void;
}

export default function NFT(props: NFTProps) {
  const {
    nftClassName,
    className,
    withControls = true,
    name,
    src,
    isSrcImage,
    hideBorder,
    status,
    transactionStatus,
    showSelection,
    defaultSelected,
    onClick,
    onSelectChange,
  } = props;
  const [selected, setSelected] = useState(!!defaultSelected);
  const isPending = transactionStatus === 'pending';
  const isTransferring = transactionStatus === 'transferringImg';
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

    if (onSelectChange) {
      setSelected(!selected);
      onSelectChange(!selected);
    }
  }, 500);

  return (
    <div className="relative font-fzdb" onClick={onNFTClick}>
      <div className={cn(['relative w-full aspect-square flex justify-center items-center', className])}>
        {hideBorder || (
          <Image
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_asset_border_display.png"
            alt=""
            fill
            unoptimized
          />
        )}

        {src ? (
          <div className={cn(['relative z-0 w-4/5 h-4/5', nftClassName])}>
            {isSrcImage ? (
              <Image className="object-contain" src={src} alt="" fill sizes="100%" unoptimized />
            ) : (
              <Video
                className="w-full h-full"
                options={{
                  controls: withControls,
                  sources: [
                    {
                      src,
                      type: 'video/webm',
                    },
                  ],
                }}
              />
            )}

            {statusImg && (
              <>
                <div className="absolute inset-0 z-10 bg-black/60"></div>

                <Image
                  className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[9.625rem] h-24"
                  src={statusImg}
                  alt=""
                />
              </>
            )}
          </div>
        ) : (
          <Image
            className="relative z-0 w-full aspect-square"
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_asset_null.png"
            alt=""
            width={240}
            height={240}
            unoptimized
          />
        )}
      </div>

      {showSelection && selected && (
        <Image className="absolute right-4 top-4 w-7 h-7" src={selectedIcon} alt="" width={56} height={56} />
      )}

      {name && <div className="text-xl h-14 mt-3 max-w-full line-clamp-2">{name}</div>}
    </div>
  );
}
