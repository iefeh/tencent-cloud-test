import { MobxContext } from '@/pages/_app';
import Image, { StaticImageData } from 'next/image';
import { useContext } from 'react';
import copyImg from 'img/profile/copy.png';
import { cn } from '@nextui-org/react';
import { toast } from 'react-toastify';

interface Props {
  className?: string;
  avatarClassName?: string;
  usernameClassName?: string;
  walletClassName?: string;
  hideCopy?: boolean;
  desc?: string | JSX.Element;
  copyText?: string;
  copyIcon?: string | StaticImageData;
}

export default function UserProfile(props: Props) {
  const { className, avatarClassName, usernameClassName, walletClassName, hideCopy, desc, copyText, copyIcon } = props;
  const { userInfo } = useContext(MobxContext);
  if (!userInfo) return null;

  const { avatar_url, username, wallet } = userInfo;

  function getWallet() {
    if (!wallet) return '--';

    return wallet.substring(0, 10) + '...' + wallet.substring(wallet.length - 4);
  }

  async function onCopy() {
    try {
      if (copyText !== undefined) {
        await navigator.clipboard.writeText(copyText);
      } else if (desc && typeof desc === 'string') {
        await navigator.clipboard.writeText(desc);
      } else {
        await navigator.clipboard.writeText(wallet || '');
      }
      toast.success('Copied!');
    } catch (error: any) {
      toast.error(error?.message || error);
    }
  }

  return (
    <div className={cn(['inline-flex items-center', className])}>
      <div className={cn(['relative rounded-full overflow-hidden', avatarClassName])}>
        <Image className="object-cover" src={avatar_url} alt="" fill />
      </div>

      <div className="ml-4 font-poppins flex flex-col">
        <div className={cn(['text-4xl leading-none', usernameClassName])}>{username}</div>
        <div className={cn(['flex items-center text-base leading-none', walletClassName])}>
          <span>{desc || getWallet()}</span>
          {!hideCopy && (desc || wallet) && (
            <Image
              className="w-auto h-[calc(1em_+_2px)] ml-2 cursor-pointer"
              src={copyIcon || copyImg}
              alt=""
              onClick={onCopy}
            />
          )}
        </div>
      </div>
    </div>
  );
}
