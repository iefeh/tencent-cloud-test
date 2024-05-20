import { FC } from 'react';
import BadgeDesc from '../BadgeDesc';
import LotteryRules from '../LotteryRules';
import BadgeMilestone from '../BadgeMilestone';
import { Lottery } from '@/types/lottery';

const BadgeScreen: FC<BasePage & ItemProps<Lottery.Pool>> = ({ item }) => {
  return (
    <div className="relative w-screen flex flex-col items-center pt-16">
      <BadgeDesc />

      <BadgeMilestone className="mt-[12.75rem] mb-[4.875rem]" item={item} />

      <LotteryRules />
    </div>
  );
};

export default BadgeScreen;
