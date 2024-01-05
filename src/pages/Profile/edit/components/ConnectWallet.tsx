import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import Image, { StaticImageData } from 'next/image';
import { useContext, useState } from 'react';
import metamaskIconImg from 'img/profile/edit/icon_metamask.png';
import rightArrowIconImg from 'img/profile/edit/icon_arrow_right.png';
import { MediaType } from '@/constant/task';
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from '@nextui-org/react';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { toast } from 'react-toastify';
import { disconnectWalletAPI } from '@/http/services/login';
import useConnect from '@/hooks/useConnect';

interface MAItem {
  title: string;
  icon: string | StaticImageData;
  type: MediaType;
  connected?: boolean;
  disconnectAPI?: () => Promise<boolean | null>;
}

const ConnectWallet = function () {
  const { userInfo, getUserInfo } = useContext(MobxContext);
  const accounts: MAItem[] = [
    {
      title: 'MetaMask',
      icon: metamaskIconImg,
      type: MediaType.METAMASK,
      connected: !!userInfo?.wallet,
      disconnectAPI: disconnectWalletAPI,
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
    const { disconnectAPI } = currentItem || {};
    if (!disconnectAPI) return;

    setDisconnectLoading(true);
    try {
      await disconnectAPI();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || error);
    } finally {
      setDisconnectLoading(false);
    }
  }

  const MediaItem = function (props: { item: MAItem }) {
    const { item } = props;
    const { onConnect } = useConnect(item.type, () => {
      getUserInfo();
    });

    return (
      <div className="flex items-center py-[1.0625rem] pl-[1.6875rem] pr-[1.875rem] border-1 border-[#252525] rounded-base bg-black hover:border-basic-yellow transition-[border-color] !duration-500">
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
            <Image className="w-[1.375rem] h-4" src={rightArrowIconImg} alt="" onClick={onConnect} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-[4.1875rem]">
      <div className="text-2xl">Connect Wallet</div>

      <div className="grid grid-cols-3 gap-[1.875rem] relative mt-[2.0625rem]">
        {accounts.map((item, index) => (
          <MediaItem key={index} item={item} />
        ))}
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{ base: 'bg-[#141414] !rounded-base', body: 'px-8 pt-[3.625rem]' }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <p className="text-center">
                  Please note that after disconnecting your account, you&apos;ll need to wait for 24 hours before
                  re-connecting. Are you sure you want to disconnect?
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

export default observer(ConnectWallet);
