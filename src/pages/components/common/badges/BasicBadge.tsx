import Image from 'next/image';
import plusImg from 'img/profile/plus.png';
import { Button, cn } from '@nextui-org/react';
import { BadgeItem } from '@/http/services/badges';
import lockIcon from 'img/profile/badges/icon_lock.png';
import { forwardRef, useState } from 'react';

interface BasicBadgeProps {
  item?: BadgeItem | null;
  forDisplay?: boolean;
  className?: string;
  onView?: (item?: BadgeItem | null) => void;
  onClaim?: (id: string) => void;
  onMint?: (id: string) => void;
}

export default forwardRef<HTMLLIElement, BasicBadgeProps>(function BasicBadge(props, ref) {
  const { item, forDisplay, className, onView, onClaim, onMint } = props;
  const [loading, setLoading] = useState(false);

  async function onClaimClick(id: string) {
    if (!onClaim) return;

    setLoading(true);
    try {
      await onClaim(id);
    } catch (error) {
      console.log('Badge Claim Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onMintClick(id: string) {
    if (!onMint) return;

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
      {item && !item?.achieved && (
        <Image className="absolute bottom-[0.625rem] right-[0.625rem] w-3 h-[0.875rem]" src={lockIcon} alt="" />
      )}

      {/* 获取按钮 */}
      {item?.achieved && !item?.claimed && (
        <div className="absolute left-0 bottom-0 w-full h-6">
          <div className="absolute inset-0 bg-[rgba(50,83,192,0.6)] z-0 transition-opacity bg"></div>
          <Button
            className="absolute inset-0 h-full z-10 bg-transparent text-sm leading-none uppercase"
            radius="none"
            isLoading={loading}
            onPress={() => onClaimClick(item.id)}
          >
            Claim
          </Button>
        </div>
      )}

      {/* Mint按钮 */}
      {item?.claimed && item?.mintable && !item?.minted && (
        <div className="absolute left-0 bottom-0 w-full h-6">
          <div className="absolute inset-0 bg-[linear-gradient(270deg,#CC6AFF,#258FFB)] opacity-70 z-0 transition-opacity bg"></div>
          <Button
            className="absolute inset-0 h-full z-10 bg-transparent text-sm leading-none uppercase"
            radius="none"
            isLoading={loading}
            onPress={() => onMintClick(item.id)}
          >
            Mint SBT
          </Button>
        </div>
      )}
    </>
  );

  return (
    <li
      ref={ref}
      className={cn([
        'w-[6.25rem] h-[6.25rem] bg-black shrink-0 border-1 border-basic-gray rounded-base shadow-basic-yellow transition-colors relative hover:border-basic-yellow hover:shadow-lg',
        item || 'empty-item',
        className,
      ])}
    >
      <div
        className={cn([
          'inline-flex justify-center items-center w-full h-full relative rounded-base overflow-hidden',
          item?.achieved || 'grayscale opacity-50',
        ])}
        onClick={() => onView?.(item)}
      >
        <div className={cn(['relative', item ? 'w-full h-full' : 'w-[1.5625rem] h-[1.5625rem]'])}>
          <Image className="object-contain" src={item?.imgUrl || plusImg} alt="" fill sizes="100%" />
        </div>

        {forDisplay ? <ContentForDisplay /> : <ContentForNonDisplay />}
      </div>

      {/* 系列标志 */}
      {item?.isSeries && (
        <span className="absolute top-0 -left-1 -translate-y-1/2 font-semakin text-basic-yellow text-xs leading-none px-1 h-[1.0625rem] inline-flex items-center border-1 border-[#333] rounded-[0.3125rem] bg-black series">
          <span className="relative top-[0.0625rem]">LV.{item.serieNo || '--'}</span>
        </span>
      )}

      {/* SBT标志 */}
      {item?.minted && (
        <span className="absolute top-0 -right-1 -translate-y-1/2 font-semakin text-basic-yellow text-xs leading-none px-1 h-[1.0625rem] inline-flex items-center border-1 border-[#333] rounded-[0.3125rem] bg-black series">
          <span className="relative top-[0.0625rem] bg-[linear-gradient(300deg,#E9E7D1_0%,#CC6AFF_0%,#258FFB_100%)] bg-clip-text text-transparent">
            SBT
          </span>
        </span>
      )}
    </li>
  );
});
