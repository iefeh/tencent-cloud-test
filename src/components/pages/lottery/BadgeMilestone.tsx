import { BadgeIcons } from '@/constant/lottery';
import { BadgeItem, claimBadgeAPI } from '@/http/services/badges';
import { Lottery } from '@/types/lottery';
import { cn, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import { FC, useState } from 'react';
import BadgeModal from '@/components/profile/badges/components/BadgeModal';
import { throttle } from 'lodash';
import { toast } from 'react-toastify';

interface Props extends ClassNameProps {
  onUpdate?: () => void;
  milestone: Lottery.MilestoneDTO | null;
}

const BadgeMilestone: FC<Props> = ({ className, milestone, onUpdate }) => {
  const currentDraws = milestone?.total_draw_amount || 0;
  const levels = BadgeIcons.map((options, index) => {
    const { requirements, image_url, icon_url } = milestone?.luckyDrawBadge?.series?.[index] || {};
    return {
      level: index + 1,
      icon: image_url || icon_url,
      draws: requirements || 0,
      ...options,
    };
  });

  function calcCurrentProgress() {
    let progress = 0;

    for (let i = 0; i < levels.length; i++) {
      const { draws } = levels[i];
      const fullPeriodDraws = i === 0 ? 70 : 105;
      let periodDraws = fullPeriodDraws;

      if (currentDraws < draws) {
        const lastDraws = levels[i - 1]?.draws || 0;
        periodDraws *= (currentDraws - lastDraws) / (draws - lastDraws);
      }

      progress += periodDraws;
      if (currentDraws <= draws) break;
    }

    return `${(progress * 100) / 1017}%`;
  }

  const currentDrawsProgress = calcCurrentProgress();

  const modalDisclosure = useDisclosure();
  const [currentItem, setCurrentItem] = useState<BadgeItem | null>(null);

  const claimBadge = throttle(async (item: BadgeItem) => {
    let lv = 1;

    if (item.has_series) {
      item.series?.forEach((serie) => {
        if (!serie.obtained_time || serie.lv <= lv) return;
        lv = serie.lv;
      });
    } else {
      lv = item.lv || 1;
    }

    const res = await claimBadgeAPI({ badge_id: item.badge_id, badge_lv: lv });
    if (res && res.result) {
      toast.success(res.result);
    }
  }, 500);

  function onBadgeClick(index: number) {
    if (!milestone?.luckyDrawBadge) return;

    const { badge_id, name, series } = milestone.luckyDrawBadge;
    const serie = series?.[index];
    setCurrentItem({
      badge_id,
      name,
      icon_url: serie?.icon_url,
      image_url: serie?.image_url,
      lv: serie.lv,
      has_series: true,
      series: [serie, series?.[index + 1]],
    });
    modalDisclosure.onOpen();
  }

  async function onClaimBadge() {
    if (!currentItem) return;
    await claimBadge(currentItem);
    onUpdate?.();
  }

  return (
    <div className={cn(['w-[63.5625rem] h-[6.8125rem] relative hidden lg:block', className])}>
      <Image
        className="object-contain"
        src="https://d3dhz6pjw7pz9d.cloudfront.net/lottery/bg_milestone.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <div className="relative z-0 w-full h-full">
        {levels.map(({ level, icon, width, left, bottom, draws }, index) => (
          <div
            key={index}
            className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer"
            style={{ left: `${left / 16}rem`, bottom: `${(bottom || 0) / 16}rem` }}
            onClick={() => onBadgeClick(index)}
          >
            <div>LV.{level}</div>

            <div
              className={!icon ? 'aspect-[726/940]' : ''}
              style={{ width: `${width / 16}rem`, maxWidth: `${width / 16}rem` }}
            >
              {icon && <Image className="w-full" src={icon} alt="" width={726} height={940} unoptimized />}
            </div>

            <div>{draws || '--'}</div>
          </div>
        ))}
      </div>

      <div className="absolute left-0 bottom-0 z-0 w-full h-2 rounded-lg">
        <Image
          className="object-cover h-full rounded-lg"
          src="https://d3dhz6pjw7pz9d.cloudfront.net/lottery/progress_milestone.png"
          alt=""
          style={{ width: currentDrawsProgress }}
          width={1017}
          height={8}
          unoptimized
        />
      </div>

      <div className="absolute -bottom-9 -translate-x-1/2 text-sm" style={{ left: currentDrawsProgress }}>
        <span className="font-semakin text-2xl">{currentDraws}</span> Draws
      </div>

      <BadgeModal item={currentItem} disclosure={modalDisclosure} canDisplay={false} onClaim={onClaimBadge} />
    </div>
  );
};

export default BadgeMilestone;
