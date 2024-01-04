import { MobxContext } from '@/pages/_app';
import Image from 'next/image';
import { useContext } from 'react';
import copyImg from 'img/profile/copy.png';
import { cn } from '@nextui-org/react';

interface Props {
  className?: string;
  avatarClassName?: string;
  usernameClassName?: string;
  walletClassName?: string;
  hideCopy?: boolean;
}

export default function UserProfile(props: Props) {
  const { className, avatarClassName, usernameClassName, walletClassName, hideCopy } = props;
  const { userInfo } = useContext(MobxContext);
  if (!userInfo) return null;

  const { avatar_url, username, wallet } = userInfo;

  function getWallet() {
    if (!wallet) return '--';

    return wallet.substring(0, 10) + '...' + wallet.substring(wallet.length - 4);
  }

  return (
    <div className={cn(['inline-flex items-center', className])}>
      <div className={cn(['relative rounded-full overflow-hidden', avatarClassName])}>
        <Image className="object-cover" src={avatar_url} alt="" fill />
      </div>

      <div className="ml-4 font-poppins flex flex-col">
        <div className={cn(['text-4xl leading-none', usernameClassName])}>{username}</div>
        <div className={cn(['flex items-center text-base leading-none', walletClassName])}>
          <span>{getWallet()}</span>
          {hideCopy || <Image className="w-auto h-[calc(1em_+_2px)] ml-2 cursor-pointer" src={copyImg} alt="" />}
        </div>
      </div>
    </div>
  );
}
