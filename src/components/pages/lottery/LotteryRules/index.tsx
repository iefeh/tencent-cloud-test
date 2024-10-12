import { BadgeIcons } from '@/constant/lottery';
import { Lottery } from '@/types/lottery';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import styles from './index.module.css';
import { isMobile } from 'react-device-detect';

interface Rule {
  title: string;
  items: (string | SubRule)[];
}

interface SubRule {
  label: string;
  children: string[];
}

interface Props {
  milestone: Lottery.MilestoneDTO | null;
}

const LotteryRules: FC<Props> = ({ milestone }) => {
  const rules: Rule[] = [
    {
      title: 'Draw Tickets',
      items: [
        {
          label: 'There are 2 types of draw tickets:',
          children: [
            'Silver Ticket: Exchange 25 Moon Beams for 1 Silver Ticket. It is valid only in the current pool.',
            'Golden S1 Ticket: Earned through special rewards. Can be used in all pools during Season 1.',
          ],
        },
        'Each draw costs 1 draw ticket.',
        'Premium Pass Holders receive 3 bonus Silver Tickets per draw pool.',
      ],
    },
    {
      title: "Newcomer's Benefit",
      items: [
        'For your first 3 draws in each pool, your chances of winning higher-level prizes are significantly increased.',
      ],
    },
    {
      title: 'Guaranteed Reward',
      items: ['Each pool ensures that the first 3,000 draws collectively guarantee a $500 cash prize.'],
    },
    {
      title: 'Number of Draws',
      items: ['You can make up to 10 draws per pool during its opening period.'],
    },
    {
      title: 'The Lucky Draw Master Badge',
      items: [
        'You can unlock the Lucky Draw Master Badge by accumulating draw counts, with the badge level increasing as you make more draws. *Surprise bonus: Achieving a Lv4 Lucky Draw Master Badge in Season 1 will grant you an S1 Premium Pass for free!',
      ],
    },
    {
      title: 'Prize Quality',
      items: [
        'Prizes are divided into 5 levels, from I to V, with Level V offering the best rewards. Each pool may have different prizes. Check the current prize list in the "Prize Pool" section.',
      ],
    },
  ];

  const drawCounts = isMobile
    ? [
        ['Level', 'Cumulative Draw Counts'],
        ...BadgeIcons.map((_, i) => [i + 1, milestone?.luckyDrawBadge?.series?.[i]?.requirements]),
      ]
    : [
        [
          'Level',
          ...Array(BadgeIcons.length)
            .fill(null)
            .map((_, index) => index + 1),
        ],
        ['Cumulative Draw Counts', ...BadgeIcons.map((_, i) => milestone?.luckyDrawBadge?.series?.[i]?.requirements)],
      ];

  return (
    <div
      className={cn([
        'w-[24rem] h-auto lg:w-[74.125rem] lg:h-[46.75rem] relative py-2 px-6 lg:pt-9 lg:pl-[3.75rem] lg:pr-8 lg:pb-6 mb-20',
        styles.badgeRules,
      ])}
    >
      <div className="w-full h-full relative z-0 text-lg mt-0 lg:mt-10">
        <div className="font-semakin text-2xl lg:text-4xl leading-none text-basic-yellow">More and $MORE Rules</div>

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
                      {typeof item === 'string' ? (
                        item
                      ) : (
                        <>
                          {(item as SubRule).label}

                          <ul>
                            {item.children.map((c, ci) => (
                              <li key={ci} className="text-sm">
                                - {c}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

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
                                      di > 0 ? 'text-center w-[4.25rem]' : 'text-right pr-4 w-8 lg:w-72',
                                      (ri < 1 || di < 1) && 'text-white',
                                    ])}
                                  >
                                    {cell || '--'}
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
