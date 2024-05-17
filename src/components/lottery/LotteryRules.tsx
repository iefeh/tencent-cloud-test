import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

const LotteryRules: FC = () => {
  const MAX_LEVEL = 10;
  const rules = [
    {
      title: 'Lottery Tickets',
      items: [
        'Each draw will cost you 1x lottery ticket.',
        'You can use 25 Moon Beams to exchange for 1x lottery ticket.',
        'As a Premium Pass Holder, you can claim 3 free tickets per pool as a bonus reward. These 3 tickets are limited to use in the specific pool only.',
      ],
    },
    {
      title: "Newcomer's Benefit",
      items: [
        'For your first 3 draws in each pool, your chances of winning higher-level prizes are significantly increased.',
      ],
    },
    {
      title: 'Jackpot Guarantee',
      items: ['Each pool ensures that the first 3,000 draws collectively guarantee a $500 cash prize.'],
    },
    {
      title: 'Number of Draws',
      items: ['You can make up to 10 draws per pool during its opening period.'],
    },
    {
      title: 'The Lucky Draw Master Badge',
      items: [
        'You can unlock the Lucky Draw Master Badge by accumulating draw counts, with the badge level increasing as you make more draws. *Surprise bonus: Achieving a Lv2 Lucky Draw Master Badge in Season 1 will grant you an S1 Premium Pass for free!',
      ],
    },
    {
      title: 'Prize Quality',
      items: [
        'Prizes are divided into 5 levels, from I to V, with Level V offering the best rewards. Each pool may have different prizes. Check the current prize list in the "Prize Pool" section.',
      ],
    },
  ];

  const drawCounts = [
    [
      'Level',
      ...Array(MAX_LEVEL)
        .fill(null)
        .map((_, index) => index + 1),
    ],
    ['Cumulative Draw Counts', 30, 60, 80, 100, 120, 140, 155, 170, 185, 200],
  ];

  return (
    <div className="w-[74.125rem] h-[46.75rem] relative pt-9 pl-[3.75rem] pr-8 pb-6 mb-20">
      <Image
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_card_rules.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <div className="w-full h-full relative z-0 text-lg mt-10">
        <div className="font-semakin text-4xl leading-none text-basic-yellow">More and $MORE Rules</div>

        <ul className="mt-6">
          {rules.map((rule, index) => (
            <li key={index}>
              <div className="font-bold">
                {index + 1}. {rule.title}:
              </div>

              <ul className="pl-6 text-white/60">
                {rule.items.map((item, idx) => (
                  <li key={idx} className="flex">
                    <div className="w-1 h-1 bg-white rounded-full mt-3 mr-2"></div>
                    <div>
                      {item}

                      {index === 4 && (
                        <table className="w-full border-1 border-white/60 my-4">
                          <tbody>
                            {drawCounts.map((row, ri) => (
                              <tr key={ri}>
                                {row.map((cell, di) => (
                                  <td
                                    key={di}
                                    className={cn([
                                      'border-1 border-white/80',
                                      di > 0 ? 'text-center w-[4.25rem]' : 'text-right pr-4 w-72',
                                      (ri < 1 || di < 1) && 'text-white',
                                    ])}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LotteryRules;
