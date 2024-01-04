import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import Image, { StaticImageData } from 'next/image';
import { useContext, useState } from 'react';
import discordIconImg from 'img/profile/edit/icon_discord.png';
import facebookIconImg from 'img/profile/edit/icon_facebook.png';
import steamIconImg from 'img/profile/edit/icon_steam.png';
import telegramIconImg from 'img/profile/edit/icon_telegram.png';
import xIconImg from 'img/profile/edit/icon_x.png';
import googleIconImg from 'img/profile/edit/icon_google.png';
import metamaskIconImg from 'img/profile/edit/icon_metamask.png';
import emailIconImg from 'img/profile/edit/icon_email.png';
import rightArrowIconImg from 'img/profile/edit/icon_arrow_right.png';
import { MediaType } from '@/constant/task';
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from '@nextui-org/react';
import LGButton from '@/pages/components/common/buttons/LGButton';

interface MAItem {
  title: string;
  icon: string | StaticImageData;
  type: MediaType;
  connected?: boolean;
}

const SocialMediaAccounts = function () {
  const { userInfo } = useContext(MobxContext);
  const accounts: MAItem[] = [
    {
      title: 'Email',
      icon: emailIconImg,
      type: MediaType.EMAIL,
      connected: !!userInfo?.email,
    },
    {
      title: 'Twitter',
      icon: xIconImg,
      type: MediaType.TWITTER,
      connected: !!userInfo?.twitter,
    },
    {
      title: 'Discord',
      icon: discordIconImg,
      type: MediaType.DISCORD,
      connected: !!userInfo?.discord,
    },
    // {
    //   title: 'Facebook',
    //   icon: facebookIconImg,
    // type: MediaType.FACEBOOK,
    //   connected: !!userInfo?.facebook,
    // },
    // {
    //   title: ' Telegram',
    //   icon: telegramIconImg,
    // type: MediaType.TELEGRAM,
    //   connected: !!userInfo?.telegram,
    // },
    {
      title: 'Steam',
      icon: steamIconImg,
      type: MediaType.STEAM,
      connected: !!userInfo?.steam,
    },
    {
      title: 'Google',
      icon: googleIconImg,
      type: MediaType.GOOGLE,
      connected: !!userInfo?.google,
    },
  ];
  const [currentItem, setCurrentItem] = useState<MAItem | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  function onConnect(item: MAItem) {}

  function onDisconnectClick(item: MAItem) {
    setCurrentItem(item);
    onOpen();
  }

  return (
    <div>
      <div className="text-2xl">Social Media Accounts</div>

      <div className="grid grid-cols-3 gap-[1.875rem]">
        {accounts.map((item, index) => (
          <div
            key={index}
            className="flex items-center py-[1.0625rem] pl-[1.6875rem] pr-[1.875rem] border-1 border-[#252525] rounded-base bg-black hover:border-basic-yellow transition-[border-color] !duration-500"
          >
            <Image className="w-[1.625rem] h-[1.625rem] object-contain" src={item.icon} alt="" width={26} height={26} />

            <div className="ml-4 flex-1 font-poppins-medium text-base">{item.title}</div>

            <div className="cursor-pointer">
              {item.connected ? (
                <span className="relative" onClick={() => onDisconnectClick(item)}>
                  Connected
                  <span className="absolute right-0 z-0 text-transparent hover:bg-black hover:text-basic-yellow transition-all !duration-500">
                    Disconnect
                  </span>
                </span>
              ) : (
                <Image className="w-[1.375rem] h-4" src={rightArrowIconImg} alt="" onClick={() => onConnect(item)} />
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} classNames={{ base: 'bg-[#141414]', body: 'px-8 pt-[3.625rem]' }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <p>
                  Please note that after disconnecting your account, you&apos;ll need to wait for 24 hours before
                  re-connecting. Are you sure you want to disconnect?
                </p>
              </ModalBody>
              <ModalFooter>
                <LGButton label="Yes" />
                <LGButton label="No" actived />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default observer(SocialMediaAccounts);
