import LGButton from '@/pages/components/common/buttons/LGButton';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import mbImg from 'img/loyalty/earn/mb.png';
import { observer } from 'mobx-react-lite';
import { useUserContext } from '@/store/User';

interface Props {
  onShowHistory?: () => void;
}

const MBInfo: FC<ClassNameProps & Props> = ({ className, onShowHistory }) => {
  const { userInfo } = useUserContext();

  return (
    <div
      className={cn([
        'w-[29.5625rem] h-[7.625rem] pl-[0.875rem] pr-[1.3125rem]',
        'relative flex justify-between items-center',
        className,
      ])}
    >
      <Image
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_mb_info.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <Image className="w-16 h-16 object-contain relative z-0" src={mbImg} alt="" unoptimized />

      <div className="flex-1 font-semakin relative z-0 ml-6">
        <div className="text-[2rem]">{userInfo?.moon_beam || '--'}</div>
        <div className="text-sm">moon beams</div>
      </div>

      <div className="flex flex-col relative z-0">
        <LGButton className="uppercase font-bold" label="Earn More MBs" link="/LoyaltyProgram/season" />
        <LGButton className="mt-4 uppercase font-bold" label="Draw History" actived onClick={onShowHistory} />
      </div>
    </div>
  );
};

export default observer(MBInfo);
