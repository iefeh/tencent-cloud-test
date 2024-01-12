import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import Image, { StaticImageData } from 'next/image';
import { useContext, useEffect, useState } from 'react';
import metamaskIconImg from 'img/profile/edit/icon_metamask.png';
import rightArrowIconImg from 'img/profile/edit/icon_arrow_right.png';
import { MediaType } from '@/constant/task';
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from '@nextui-org/react';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { toast } from 'react-toastify';
import { disconnectMediaAPI } from '@/http/services/login';
import useConnect from '@/hooks/useConnect';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import errorIconImg from 'img/icon/icon_error.png';

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
    },
  ];
  const [currentItem, setCurrentItem] = useState<MAItem | null>(null);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const { isConnected } = useWeb3ModalAccount();

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
      // toast.error(error?.message || error);
      console.log(error);
    } finally {
      setDisconnectLoading(false);
    }
  }

  useEffect(() => {
    if (isConnected) getUserInfo();
  }, [isConnected]);

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

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-[1.875rem] relative mt-[2.0625rem]">
        {accounts.map((item, index) => (
          <MediaItem key={index} item={item} />
        ))}
      </div>

      <Modal
        placement="center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{ base: 'bg-[#141414] !rounded-base max-w-[30rem]', body: 'px-8 pt-[3.625rem] flex-row' }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <Image className="w-8 h-8 object-contain align-bottom mr-2" src={errorIconImg} alt="" />

                <p>
                  Please note that if you choose to disconnect this account now, a 12-hour waiting period will be
                  required before you can reconnect it. Are you sure you want to disconnect?
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
