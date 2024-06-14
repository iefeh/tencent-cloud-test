import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import metamaskIconImg from 'img/profile/edit/icon_metamask.png'
import { MediaType } from '@/constant/task';
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from '@nextui-org/react';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { disconnectMediaAPI } from '@/http/services/login';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import errorIconImg from 'img/icon/icon_error.png';
import { formatUserName } from '@/utils/common';
import MediaItem, { MAItem } from './MediaItem';

const ConnectWallet = function () {
  const { userInfo, getUserInfo } = useContext(MobxContext);
  const accounts: MAItem[] = [
    {
      title: 'MetaMask',
      icon: metamaskIconImg,
      type: MediaType.METAMASK,
      connected: !!userInfo?.wallet,
      connectedAccount: userInfo?.wallet,
      format: formatUserName,
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
      console.log(error);
    } finally {
      setDisconnectLoading(false);
    }
  }

  useEffect(() => {
    if (isConnected) getUserInfo();
  }, [isConnected]);

  return (
    <div className="mt-[4.1875rem]">
      <div className="text-2xl">Connect Wallet</div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-[1.875rem] relative mt-[2.0625rem]">
        {accounts.map((item, index) => (
          <MediaItem key={index} item={item} onDisconnectClick={onDisconnectClick} />
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
