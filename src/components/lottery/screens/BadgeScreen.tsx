import { FC } from 'react';
import BadgeDesc from '../BadgeDesc';
import LotteryRules from '../LotteryRules';
import BadgeMilestone from '../BadgeMilestone';

const BadgeScreen: FC & BasePage = () => {
  return (
    <div className="relative w-screen flex flex-col items-center pt-16">
      <BadgeDesc />

      <BadgeMilestone className='mt-[12.75rem] mb-[4.875rem]' />

      <LotteryRules />
    </div>
  );
};

export default BadgeScreen;
