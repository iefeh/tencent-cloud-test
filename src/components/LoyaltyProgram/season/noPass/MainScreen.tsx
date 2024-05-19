import BattlePassCard from '@/components/card/BattlePassCard';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import Invite from './Invite';
import { cn } from '@nextui-org/react';
import { isMobile } from 'react-device-detect';
import MoonBeams from './MoonBeams';

const MainScreen: FC = () => {
  return (
    <div className={cn(['mx-auto pt-9', isMobile ? 'w-full pb-24' : 'w-[72.5rem] pb-[15.875rem]'])}>
      <BattlePassCard noPass />

      <div className={cn(['flex mt-9 gap-9 w-full', isMobile && 'flex-col'])}>
        <MoonBeams />

        {/* TODO 替换Store */}
        <Invite inProfie />
      </div>
    </div>
  );
};

export default observer(MainScreen);
