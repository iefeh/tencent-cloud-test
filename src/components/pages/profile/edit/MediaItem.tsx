import { MediaType } from '@/constant/task';
import useConnect from '@/hooks/useConnect';
import { useUserContext } from '@/store/User';
import Image, { StaticImageData } from 'next/image';
import { FC } from 'react';
import rightArrowIconImg from 'img/profile/edit/icon_arrow_right.png';
import { Tooltip, useDisclosure } from '@nextui-org/react';
import errorIconImg from 'img/icon/icon_error.png';
import BindTipsModal from '@/components/common/modal/BindTipsModal';
import NoticeModal from '@/components/common/modal/NoticeModal';

export interface MAItem {
  title: string;
  icon: string | StaticImageData;
  type: MediaType;
  format?: (val?: string) => string;
  connected?: boolean;
  connectedAccount?: string;
  disconnectAPI?: () => Promise<boolean | null>;
}

interface Props {
  undisconnectable?: boolean;
  item: MAItem;
  onDisconnectClick?: (item: MAItem) => void;
}

const MediaItem: FC<Props> = ({ undisconnectable, item, onDisconnectClick }) => {
  const { getUserInfo } = useUserContext();
  const noticeDisclosure = useDisclosure();
  const { onConnect, bindTipsDisclosure } = useConnect(item.type, () => {
    getUserInfo();
  });

  return (
    <div className="flex items-center py-[1.0625rem] pl-[1.6875rem] pr-[1.875rem] border-1 border-[#252525] rounded-base bg-black hover:border-basic-yellow transition-[border-color] !duration-500">
      <Image className="w-[1.625rem] h-[1.625rem] object-contain" src={item.icon} alt="" width={26} height={26} />

      <Tooltip
        content={
          <div className="max-w-[28rem] px-4 py-2 flex">
            <Image className="w-6 h-6 object-contain align-bottom mr-2" src={errorIconImg} alt="" />

            <div>
              We recommend all Moonwalkers to connect your{' '}
              <span className="text-basic-yellow">commonly used accounts</span>. The{' '}
              <span className="text-basic-yellow">rewards</span> and{' '}
              <span className="text-basic-yellow">game data</span> in the Moonveil ecosystem will be tightly linked to
              the connected account. Please note that frequent disconnection and reconnection{' '}
              <span className="text-basic-yellow">may result in the inability to claim rewards</span>.
            </div>
          </div>
        }
      >
        <div className="ml-4 flex-1 font-poppins-medium text-base">{item.title}</div>
      </Tooltip>

      <div className="cursor-pointer">
        {item.connected ? (
          undisconnectable ? null : (
            <span className="relative group" onClick={() => onDisconnectClick?.(item)}>
              <span className="group-hover:text-transparent transition-colors inline-block max-w-[16rem] overflow-hidden whitespace-nowrap text-ellipsis">
                {(item.format ? item.format(item.connectedAccount) : item.connectedAccount) || 'Connected'}
              </span>
              <span className="absolute right-0 z-0 text-transparent group-hover:bg-black group-hover:text-basic-yellow transition-all !duration-500">
                Disconnect
              </span>
            </span>
          )
        ) : (
          <Image
            className="w-[1.375rem] h-4"
            src={rightArrowIconImg}
            alt=""
            onClick={undisconnectable ? noticeDisclosure.onOpen : onConnect}
          />
        )}
      </div>

      <BindTipsModal disclosure={bindTipsDisclosure} />

      <NoticeModal
        disclosure={{
          ...noticeDisclosure,
          onOpenChange(isOpen) {
            if (isOpen) return;
            noticeDisclosure.onClose();
            onConnect();
          },
        }}
      />
    </div>
  );
};

export default MediaItem;
