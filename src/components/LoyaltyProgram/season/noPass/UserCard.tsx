import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC, useContext } from 'react';
import badgeImg from 'img/common/battlepass/badge_user_center.png';
import BasicButton from '@/pages/components/common/BasicButton';
import { MobxContext } from '@/pages/_app';
import defaultAvatarImg from 'img/favicon.png';
import { cn } from '@nextui-org/react';
import { isMobile } from 'react-device-detect';

const UserCard: FC = () => {
  const { userInfo } = useContext(MobxContext);

  return (
    <div
      className={cn([
        'h-[13.75rem] relative overflow-hidden rounded-base border-1 border-[#1D1D1D] hover:border-basic-yellow transition-[border-color] p-10',
        "bg-[length:auto_100%] bg-[url('/img/common/battlepass/bg_user_card.png')] bg-left bg-no-repeat",
        isMobile ? 'w-full' : 'w-[42.5rem]',
      ])}
    >
      <Image className="relative z-0 w-32 h-[2.625rem] object-contain" src={badgeImg} alt="" />

      <div className="flex items-center mt-16 relative z-0">
        <BasicButton className="uppercase" label="User Center" needAuth link="/Profile" />

        <div className="max-w-[11rem] ml-4 overflow-hidden whitespace-nowrap text-ellipsis">
          {userInfo ? userInfo.username : 'Please log in first'}
        </div>
      </div>

      {isMobile || (
        <div className="w-[6.25rem] h-[6.25rem] absolute z-10 top-1/2 right-[8.5rem] -translate-y-1/2 border-1 border-basic-yellow rounded-full overflow-hidden">
          <Image className="object-cover" src={userInfo?.avatar_url || defaultAvatarImg} alt="" fill sizes="100%" />
        </div>
      )}
    </div>
  );
};

export default observer(UserCard);
