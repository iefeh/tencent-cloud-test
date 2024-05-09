import BattlePassCard from '@/components/card/BattlePassCard';
import Rank from '@/components/LoyaltyProgram/earn/BannerAndRank/Rank';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import UserCard from './UserCard';
import { cn } from '@nextui-org/react';
import { isMobile } from 'react-device-detect';
import LotteryCard from './LotteryCard';

const MainScreen: FC = () => {
  return (
    <div className={cn(['mx-auto pt-9', isMobile ? 'w-full pb-24' : 'w-[72.5rem] pb-[15.875rem]'])}>
      <BattlePassCard noPass />

      <div className={cn(['flex mt-9 gap-9', isMobile && 'flex-col'])}>
        <Rank className={isMobile ? 'w-full' : ''} />

        <div>
          <UserCard />

          <LotteryCard />
        </div>
      </div>
    </div>
  );
};

export default observer(MainScreen);
