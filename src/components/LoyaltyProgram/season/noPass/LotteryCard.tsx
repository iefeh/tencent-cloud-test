import Image from 'next/image';
import storeImg from 'img/loyalty/season/store.png';
import { useContext } from 'react';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { cn } from '@nextui-org/react';
import LGButton from '@/pages/components/common/buttons/LGButton';

const LotteryCard = function () {
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const router = useRouter();

  function onInviteClick() {
    if (!userInfo) {
      toggleLoginModal(true);
    } else {
      router.push('/Profile/invite');
    }
  }

  return (
    <div
      className={cn([
        'w-[42.5rem] h-[21.25rem] relative overflow-hidden rounded-[0.625rem] border-1 border-basic-gray pt-[2rem] pr-[2rem] pb-[2.5rem] pl-[2.375rem] flex justify-between items-center hover:border-basic-yellow transition-[border-color] duration-500 mt-[2.3125rem]',
        "bg-[url('/img/invite/bg_content.png')] bg-[position:right_-1.5rem] bg-no-repeat bg-contain",
      ])}
    >
      <div className="flex flex-col justify-between relative z-0 h-full">
        <Image
          className="w-[11.125rem] h-[2.625rem] mt-[0.4375rem] ml-[0.3125rem] relative z-0"
          src={storeImg}
          alt=""
        />

        <div className="relative z-0">
          <p className="text-sm max-w-[19.5rem] mb-[1.875rem]">
            Exchange your Moon Beams for $Moonrise Tokens, in-game rewards, and more various premium perks.
          </p>

          <LGButton className="uppercase" label="Exchange Now" actived link="/draw" />
        </div>
      </div>
    </div>
  );
};

export default observer(LotteryCard);
