import { IntersectionObserverHook } from '@/hooks/intersectionObserverHook';
import PageDesc from '@/components/common/PageDesc';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import { useRouter } from 'next/router';
import { FC, useRef } from 'react';
import { cn } from '@nextui-org/react';

interface Props {
  onShowPrizePool?: () => void;
}

const DrawScreenMainContent: FC<Props & ItemProps<Lottery.Pool>> = ({ item, onShowPrizePool }) => {
  const router = useRouter();
  const { id } = router.query;
  const titleRef = useRef<HTMLDivElement>(null);
  const visible = IntersectionObserverHook({ currentRef: titleRef });

  return (
    <PageDesc
      baseAniTY
      needAni={visible || !!id}
      className="-translate-y-12 items-center text-center"
      title={
        item?.title && (
          <div ref={id ? null : titleRef} className="font-semakin ani-twirl">
            {item.title.split('').map((t, i) => (
              <span
                key={i}
                className={cn([
                  'char stroke-text [&+.char]:-ml-8',
                  t.charCodeAt(0) > 96 ? 'text-4xl lg:text-[4rem]' : 'text-6xl lg:text-[6rem]',
                ])}
                data-text={t}
              >
                {t === ' ' ? <>&nbsp;</> : t}
              </span>
            ))}
          </div>
        )
      }
      subtitle={
        <div className="flex items-center font-semakin">
          <div className="text-right">
            <div className="text-xl lg:text-2xl">guaranteed in</div>
            <div className="text-xl lg:text-3xl lg:text-[2rem] bg-gradient-to-b from-[#E7D4A9] to-[#DBAC74] bg-clip-text text-transparent">
              3000 Collective Draws
            </div>
          </div>

          <div className="stroke-text text-3xl lg:text-[4rem]" data-text="Per Pool">
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
