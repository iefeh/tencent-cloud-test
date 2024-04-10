import BattlePassCard from '@/components/card/BattlePassCard';
import Rank from '@/components/LoyaltyProgram/earn/BannerAndRank/Rank';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import UserCard from './UserCard';

const MainScreen: FC = () => {
  return (
    <div className="w-[72.5rem] mx-auto pt-9 pb-[15.875rem]">
      <BattlePassCard noPass />

      <div className="flex mt-9 gap-9">
        <Rank />

        <div>
          <UserCard />
        </div>
      </div>
    </div>
  );
};

export default observer(MainScreen);
