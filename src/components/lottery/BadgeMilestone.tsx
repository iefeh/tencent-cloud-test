import { BadgeIcons } from '@/constant/lottery';
import { Lottery } from '@/types/lottery';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

interface Props extends ClassNameProps {
  milestone: Lottery.MilestoneDTO | null;
}

const BadgeMilestone: FC<Props & ItemProps<Lottery.Pool>> = ({ className, item, milestone }) => {
  const currentDraws = milestone?.total_draw_amount || 0;
  const levels = BadgeIcons.map((options, index) => {
    const { requirements, image_url } = milestone?.luckyDrawBadge?.series?.[index] || {};
    return {
      level: index + 1,
      icon: image_url,
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

  return (
    <div className={cn(['w-[63.5625rem] h-[6.8125rem] relative', className])}>
      <Image
        className="object-contain"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_milestone.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <div className="relative z-0 w-full h-full">
        {levels.map(({ level, icon, width, left, bottom, draws }, index) => (
          <div
            key={index}
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${left / 16}rem`, bottom: `${(bottom || 0) / 16}rem` }}
          >
            <div>LV.{level}</div>

            <Image
              src={icon || ''}
              alt=""
              style={{ width: `${width / 16}rem`, maxWidth: `${width / 16}rem` }}
              width={726}
              height={940}
              unoptimized
            />

            <div>{draws || '--'}</div>
          </div>
        ))}
      </div>

      <div className="absolute left-0 bottom-0 z-0 w-full h-2 rounded-lg">
        <Image
          className="object-cover h-full rounded-lg"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/progress_milestone.png"
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
    </div>
  );
};

export default BadgeMilestone;
