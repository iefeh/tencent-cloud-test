import { FC } from 'react';
import BadgeDesc from '../BadgeDesc';
import LotteryRules from '../LotteryRules';

const BadgeScreen: FC & BasePage = () => {
  return (
    <div className="relative w-screen flex flex-col items-center pt-16">
      <BadgeDesc />

      <LotteryRules />
    </div>
  );
};

export default BadgeScreen;
