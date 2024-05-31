import { IntersectionObserverHook } from '@/hooks/intersectionObserverHook';
import PageDesc from '@/pages/components/common/PageDesc';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import { FC, useRef } from 'react';

interface Props {
  onShowPrizePool?: () => void;
}

const DrawScreenMainContent: FC<Props & ItemProps<Lottery.Pool>> = ({ item, onShowPrizePool }) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const visible = IntersectionObserverHook({ currentRef: titleRef });

  return (
    <PageDesc
      baseAniTY
      needAni={visible}
      className="-translate-y-12 items-center"
      title={
        <div ref={titleRef} className="font-semakin ani-twirl">
          <span className="text-[4rem]">
            {'WIN'.split('').map((t, i) => (
              <span key={i} className="char stroke-text [&+.char]:-ml-8" data-text={t}>
                {t}
              </span>
            ))}
          </span>

          <span className="text-[6rem]">
            {'$500 USDT'.split('').map((t, i) => (
              <span key={i} className="char stroke-text [&+.char]:-ml-8" data-text={t}>
                {t}
              </span>
            ))}
          </span>
        </div>
      }
      subtitle={
        <div className="flex items-center font-semakin">
          <div className="text-right">
            <div className="text-2xl">guaranteed in</div>
            <div className="text-[2rem] bg-gradient-to-b from-[#E7D4A9] to-[#DBAC74] bg-clip-text text-transparent">
              3000 Collective Draws
            </div>
          </div>

          <div className="stroke-text text-[4rem]" data-text="Per Pool">
            Per Pool
          </div>
        </div>
      }
      button={
        <LGButton className="uppercase mt-8" label="Prize Pool" actived disabled={!item} onClick={onShowPrizePool} />
      }
    />
  );
};

export default DrawScreenMainContent;
