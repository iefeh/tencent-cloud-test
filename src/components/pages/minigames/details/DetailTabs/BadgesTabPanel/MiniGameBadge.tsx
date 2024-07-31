import Image from 'next/image';
import plusImg from 'img/profile/plus.png';
import helpIcon from 'img/profile/badges/icon_help.png';
import { Button, cn } from '@nextui-org/react';
import { BadgeItem } from '@/http/services/badges';
import lockIcon from 'img/profile/badges/icon_lock.png';
import { forwardRef, useState } from 'react';
import { BadgeMintStatus } from '@/constant/badge';

interface BasicBadgeProps {
  item?: BadgeItem | null;
  forDisplay?: boolean;
  className?: string;
  onView?: (item?: BadgeItem | null) => void;
  onClaim?: (item: BadgeItem) => void;
  onMint?: (id: string) => void;
}

export default forwardRef<HTMLLIElement, BasicBadgeProps>(function MiniGameBadge(props, ref) {
  const { item, forDisplay, className, onView, onClaim, onMint } = props;
  const [loading, setLoading] = useState(false);

  const { series, display, image_url: displayImageUrl, icon_url: displayIconUrl, lv: displayLv } = item || {};
  const validSerie = series?.[0] || series?.[1];
  const {
    claimed_time,
    obtained_time,
    lv: bagLv,
    image_url: bagImageUrl,
    icon_url: bagIconUrl,
    mint,
  } = validSerie || {};

  const claimed = !!claimed_time;
  const achieved = !!obtained_time;
  const image_url = displayImageUrl || bagImageUrl;
  const icon_url = displayIconUrl || bagIconUrl;
  const lv = displayLv || bagLv;

  async function onClaimClick(item: BadgeItem) {
    if (!onClaim) return;

    setLoading(true);
    try {
      await onClaim(item);
    } catch (error) {
      console.log('Badge Claim Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onMintClick(id?: string) {
    if (!onMint || !id) return;

    setLoading(true);
    try {
      await onMint(id);
    } catch (error) {
      console.log('Badge Mint Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const ContentForDisplay = () => <></>;

  const ContentForNonDisplay = () => (
    <>
      {/* 未获得标志 */}
      {item && !achieved && (
        <Image
          className="absolute bottom-[0.625rem] right-[0.625rem] w-3 h-[0.875rem]"
          src={lockIcon}
          alt=""
          unoptimized
          priority
        />
      )}

      {/* 获取按钮 */}
      {item && achieved && !claimed && (
        <div className="absolute left-0 bottom-0 w-full h-8">
          <div className="absolute inset-0 bg-[#0E8AFC] z-0 transition-opacity bg"></div>
          <Button
            className="absolute inset-0 h-full z-10 bg-transparent text-sm leading-none uppercase"
            radius="none"
            isLoading={loading}
            onPress={() => onClaimClick(item)}
          >
            Claim
          </Button>
        </div>
      )}

      {/* Mint按钮 */}
      {claimed && mint && [BadgeMintStatus.QUALIFIED, BadgeMintStatus.MINTING].includes(mint.status) && (
        <div className="absolute left-0 bottom-0 w-full h-8">
          <div className="absolute inset-0 bg-[linear-gradient(270deg,#CC6AFF,#258FFB)] opacity-70 z-0 transition-opacity bg"></div>
          <Button
            className="absolute inset-0 h-full z-10 bg-transparent text-sm leading-none uppercase"
            radius="none"
            isLoading={loading || mint.status === BadgeMintStatus.MINTING}
            disabled={!mint || mint.status !== BadgeMintStatus.QUALIFIED}
            onPress={() => onMintClick(mint.id)}
          >
            {mint.status === BadgeMintStatus.MINTING ? 'SBT Minting' : 'Mint SBT'}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <li
      ref={ref}
      className={cn([
        'px-[1.125rem] pt-5 pb-6 shrink-0 relative rounded-[1.25rem] border-2 border-basic-gray transition-colors bg-[#F7E9CC] hover:bg-white',
        item ? 'drag-item' : 'empty-item',
        className,
      ])}
    >
      <div
        className={cn([
          'inline-flex justify-center items-center w-[13.75rem] h-[13.75rem] bg-black relative overflow-hidden border-1 border-basic-gray rounded-base transition-colors',
          item && !achieved && 'grayscale opacity-50',
        ])}
        onClick={() => onView?.(item)}
      >
        <div className={cn(['relative', !item && forDisplay ? 'w-[1.5625rem] h-[1.5625rem]' : 'w-full h-full'])}>
          <Image
            className={cn(['object-contain', image_url || 'grayscale'])}
            src={image_url || (forDisplay ? plusImg : helpIcon)}
            alt=""
            fill
            sizes="100%"
            unoptimized
          />

          {item && achieved && !claimed && (
            <div className="absolute inset-0 border-2 border-[#0E8AFC] pointer-events-none z-0 rounded-base"></div>
          )}
        </div>

        {forDisplay ? <ContentForDisplay /> : <ContentForNonDisplay />}
      </div>

      <p className="text-brown text-center text-base leading-none mt-4">{item?.name || '--'}</p>

      {/* 系列标志 */}
      {item?.has_series && (
        <span className="absolute top-7 left-7 font-semakin text-basic-yellow text-xs leading-none px-1 h-[1.0625rem] inline-flex items-center border-1 border-[#333] rounded-[0.3125rem] bg-black series">
          <span className="relative top-[0.0625rem]">LV.{lv || '--'}</span>
        </span>
      )}

      {/* SBT标志 */}
      {mint && mint.status === BadgeMintStatus.MINTED && (
        <span className="absolute top-7 right-7 font-semakin text-basic-yellow text-xs leading-none px-1 h-[1.0625rem] inline-flex items-center border-1 border-[#333] rounded-[0.3125rem] bg-black series">
          <span className="relative top-[0.0625rem] bg-[linear-gradient(300deg,#E9E7D1_0%,#CC6AFF_0%,#258FFB_100%)] bg-clip-text text-transparent">
            SBT
          </span>
        </span>
      )}
    </li>
  );
});
