import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { useContext, useState } from 'react';
import discordIconImg from 'img/profile/edit/icon_discord.png';
import steamIconImg from 'img/profile/edit/icon_steam.png';
import xIconImg from 'img/profile/edit/icon_x.png';
import googleIconImg from 'img/profile/edit/icon_google.png';
import telegramIconImg from 'img/profile/edit/icon_telegram.png';
import emailIconImg from 'img/profile/edit/icon_email.png';
import { MediaType } from '@/constant/task';
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from '@nextui-org/react';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { disconnectMediaAPI } from '@/http/services/login';
import errorIconImg from 'img/icon/icon_error.png';
import MediaItem, { MAItem } from './MediaItem';

const SocialMediaAccounts = function () {
  const { userInfo, getUserInfo } = useContext(MobxContext);
  const accounts: MAItem[] = [
    {
      title: 'Email',
      icon: emailIconImg,
      type: MediaType.EMAIL,
      connected: !!userInfo?.email,
      connectedAccount: userInfo?.email,
    },
    {
      title: 'Twitter',
      icon: xIconImg,
      type: MediaType.TWITTER,
      connected: !!userInfo?.twitter,
      connectedAccount: userInfo?.twitter?.username,
    },
    {
      title: 'Discord',
      icon: discordIconImg,
      type: MediaType.DISCORD,
      connected: !!userInfo?.discord,
      connectedAccount: userInfo?.discord?.username,
    },
    // {
    //   title: 'Facebook',
    //   icon: facebookIconImg,
    //   type: MediaType.FACEBOOK,
    //   connected: !!userInfo?.facebook,
    // },
    {
      title: 'Telegram',
      icon: telegramIconImg,
      type: MediaType.TELEGRAM,
      connected: !!userInfo?.telegram,
      connectedAccount: userInfo?.telegram?.username,
    },
    {
      title: 'Steam',
      icon: steamIconImg,
      type: MediaType.STEAM,
      connected: !!userInfo?.steam,
      connectedAccount: userInfo?.steam?.username,
    },
    {
      title: 'Google',
      icon: googleIconImg,
      type: MediaType.GOOGLE,
      connected: !!userInfo?.google,
      connectedAccount: userInfo?.google?.username,
    },
  ];
  const [currentItem, setCurrentItem] = useState<MAItem | null>(null);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  function onDisconnectClick(item: MAItem) {
    setCurrentItem(item);
    onOpen();
  }

  async function onDisconnect() {
    if (!currentItem) return;

    setDisconnectLoading(true);
    try {
      await disconnectMediaAPI(currentItem.type);
      onClose();
      getUserInfo();
    } catch (error: any) {
      console.log(error);
    } finally {
      setDisconnectLoading(false);
    }
  }

  return (
    <div className="mt-[4.1875rem]">
      <div className="text-2xl">Social Media Accounts</div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-[1.875rem] relative mt-[2.0625rem]">
        {accounts.map((item, index) => (
          <MediaItem key={index} item={item} onDisconnectClick={onDisconnectClick} />
        ))}
      </div>

      <Modal
        placement="center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{ base: 'bg-[#141414] !rounded-base max-w-[48rem]', body: 'px-8 pt-[3.625rem] flex-row' }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <Image className="w-8 h-8 object-contain align-bottom mr-2" src={errorIconImg} alt="" />

                <p>
                  {accounts.filter((a) => a.connected).length < 2 ? (
                    <>
                      <div>
                        Please be aware that this is the <span className="text-notion">LAST ACCOUNT</span> connected on
                        our website.
                      </div>

                      <div>
                        Disconnecting it will result in <span className="text-notion">PERMANENT LOSS</span> of this
                        account and <span className="text-notion">ALL associated rewards and game data</span>, with{' '}
                        <span className="text-notion">NO POSSIBILITY</span> of recovery. Are you sure you want to
                        proceed with this operation?
                      </div>
                    </>
                  ) : (
                    'Please note that if you choose to disconnect this account now, a 12-hour waiting period will be required before you can reconnect it. Are you sure you want to disconnect?'
                  )}
                </p>
              </ModalBody>
              <ModalFooter>
                <LGButton loading={disconnectLoading} className="uppercase" label="Yes" onClick={onDisconnect} />
                <LGButton className="uppercase" label="No" actived onClick={onClose} />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default observer(SocialMediaAccounts);
