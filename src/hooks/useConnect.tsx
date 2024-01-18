import { throttle } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { MediaType } from '@/constant/task';
import { connectMediaAPI, connectWalletAPI } from '@/http/services/login';
import { toast } from 'react-toastify';
import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider } from 'ethers';
import { MobxContext } from '@/pages/_app';
import { Modal, ModalContent, ModalBody, useDisclosure } from '@nextui-org/react';
import LGButton from '@/pages/components/common/buttons/LGButton';

export default function useConnect(type: string, callback?: (args?: any) => void) {
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const dialogWindowRef = useRef<Window | null>(null);
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const authConnect = throttle(function () {
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_CONNECT) || {};
    if (!tokens[type]) return;
    dialogWindowRef.current?.close();
    dialogWindowRef.current = null;
    const { code, msg } = tokens[type] || {};
    if (+code === 1) {
      callback?.();
    } else {
      if (msg) {
        toast.error(msg);
      }

      if ([-9, -13, -16].includes(+code)) {
        onOpen();
      }
    }
    delete tokens[type];
    localStorage.save(KEY_AUTHORIZATION_CONNECT, tokens);
  }, 300);

  function openAuthWindow(authURL: string) {
    setTimeout(() => {
      const dialog = window.open(
        authURL,
        'Authrization',
        'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
      );
      dialogWindowRef.current = dialog;
    }, 0);
  }

  async function onConnectWallet() {
    setLoading(true);
    const message = `Please confirm that you are the owner of this wallet by signing this message.\nSigning this message is safe and will NOT trigger any blockchain transactions or incur any fees.\nTimestamp: ${Date.now()}`;
    const provider = new BrowserProvider(walletProvider!);

    try {
      const signer = await provider.getSigner();
      const signature = await signer?.signMessage(message);

      const data = {
        address: address as `0x${string}`,
        message,
        signature,
      };
      await connectWalletAPI(data);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function onConnect() {
    if (!userInfo) {
      console.log('connect no userInfo');
      toggleLoginModal(true);
      return;
    }

    if (type === MediaType.EMAIL) {
      console.log('connect email');
      toggleLoginModal(true);
      return;
    }

    if (type === MediaType.METAMASK) {
      if (isConnected) {
        await onConnectWallet();
        callback?.();
      } else {
        open();
      }

      return;
    }

    if (!type) {
      toast.error('Invalid authorization type!');
      return;
    }

    setLoading(true);
    const res = await connectMediaAPI(type);
    if (!res?.authorization_url) {
      toast.error('Get authorization url failed!');
      setLoading(false);
      return;
    }

    openAuthWindow(res.authorization_url);
    setLoading(false);
  }

  useEffect(() => {
    window.addEventListener('storage', authConnect);
    return () => window.removeEventListener('storage', authConnect);
  }, []);

  const BindTipsModal = () => {
    return (
      <Modal
        placement="center"
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{ base: 'bg-[#141414] rounded-base max-w-40rem' }}
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              <div className="flex flex-col items-center pt-12 pb-10">
                <p>
                  We have detected an account connection conflict. This occurs when an attempt is made to link a
                  platform that is already connected to another account. To resolve this, please follow these steps:
                </p>
                <p>1. Log in with the platform that is currently linked to the conflicting account.</p>
                <p>2. Go to [User Center], and disconnect the platform account causing the conflict.</p>
                <p>
                  3. Wait for 12 hours before attempting to reconnect. This cooldown period helps us maintain platform
                  integrity and prevent abusive practices.
                </p>
                <p>4. After 12 hours, log in again and link the account you wish to use.</p>
                <p>If you encounter any issues, please contact our support team for assistance.</p>

                <LGButton className="mt-4" actived label="Close" onClick={onClose} />
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    );
  };

  return { onConnect, loading, BindTipsModal };
}
