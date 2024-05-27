import { MobxContext } from '@/pages/_app';
import Image, { StaticImageData } from 'next/image';
import { useContext } from 'react';
import copyImg from 'img/profile/copy.png';
import { cn } from '@nextui-org/react';
import { toast } from 'react-toastify';
import { observer } from 'mobx-react-lite';
import LGButton from './buttons/LGButton';
import { formatUserName } from '@/utils/common';

interface Props {
  className?: string;
  avatarClassName?: string;
  usernameClassName?: string;
  walletClassName?: string;
  hideCopy?: boolean;
  desc?: string | JSX.Element;
  copyText?: string;
  copyIcon?: string | StaticImageData;
  showRedeem?: boolean;
  isAddressColumn?: boolean;
}

function UserProfile(props: Props) {
  const {
    className,
    avatarClassName,
    usernameClassName,
    walletClassName,
    hideCopy,
    desc,
    copyText,
    copyIcon,
    isAddressColumn,
    showRedeem,
  } = props;
  const { userInfo, toggleRedeemModal } = useContext(MobxContext);
  if (!userInfo) return null;

  const { avatar_url, username, wallet, particle } = userInfo;

  async function onCopy(text?: string) {
    try {
      if (copyText !== undefined) {
        await navigator.clipboard.writeText(copyText);
      } else if (desc && typeof desc === 'string') {
        await navigator.clipboard.writeText(desc);
      } else {
        await navigator.clipboard.writeText(text || '');
      }
      toast.success('Copied!');
    } catch (error: any) {
      toast.error(error?.message || error);
    }
  }

  return (
    <div className={cn(['inline-flex items-center', className])}>
      <div className={cn(['relative rounded-full overflow-hidden', avatarClassName])}>
        <Image className="object-cover" src={avatar_url} alt="" fill crossOrigin="anonymous" sizes="100%" />
      </div>

      <div className="ml-4 font-poppins flex flex-col">
        <div className="flex items-center">
          <div
            className={cn([
              'text-4xl leading-none max-w-[12rem] text-ellipsis overflow-hidden whitespace-nowrap',
              usernameClassName,
            ])}
          >
            {formatUserName(username)}
          </div>

          {showRedeem && <LGButton className="ml-4" label="Redeem" actived onClick={toggleRedeemModal} />}
        </div>

        <div className={cn(['flex gap-x-8', isAddressColumn ? 'flex-col' : 'items-center'])}>
          <div className={cn(['flex items-center text-base leading-none', walletClassName])}>
            <span className="mr-4 w-36">Connected Wallet</span>
            <span className="px-2 py-1 rounded-sm bg-gradient-to-r from-basic-yellow/20 to-transparent">
              {desc || formatUserName(wallet) || '--'}
            </span>
            {!hideCopy && (desc || wallet) && (
              <Image
                className="w-auto h-[calc(1em_+_2px)] ml-2 cursor-pointer"
                src={copyIcon || copyImg}
                alt=""
                onClick={() => onCopy(wallet)}
              />
            )}
          </div>

          <div className={cn(['flex items-center text-base leading-none', walletClassName])}>
            <span className="mr-4 w-36">Moonveil Wallet</span>
            <span className="px-2 py-1 rounded-sm bg-gradient-to-r from-basic-yellow/20 to-transparent">
              {desc || formatUserName(particle?.evm_wallet) || '--'}
            </span>
            {!hideCopy && particle?.evm_wallet && (
              <Image
                className="w-auto h-[calc(1em_+_2px)] ml-2 cursor-pointer"
                src={copyIcon || copyImg}
                alt=""
                onClick={() => onCopy(particle?.evm_wallet)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default observer(UserProfile);
