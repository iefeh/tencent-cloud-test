import { throttle } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { MediaType } from '@/constant/task';
import {
  connectMediaAPI,
  connectTelegramAuthAPI,
  connectWalletAPI,
  connectTelegramAPI,
  getTelegramAuthData,
} from '@/http/services/login';
import { TelegramLoginData, TelegramAuthData } from '@/http/services/login';
import { toast } from 'react-toastify';
import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider } from 'ethers';
import { MobxContext } from '@/pages/_app';
import { Modal, ModalContent, ModalBody, useDisclosure } from '@nextui-org/react';
import LGButton from '@/pages/components/common/buttons/LGButton';
import useWatchStorage from './useWatchStorage';
import { appendQueryParamsToUrl } from '@/lib/common/url';

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
  }, 500);

  const { startWatch, stopWatch } = useWatchStorage({ key: KEY_AUTHORIZATION_CONNECT, callback: authConnect });

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
      if (userInfo?.wallet) return;

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

  async function onTelegramConnect() {
    setLoading(true);
    const res = await connectTelegramAuthAPI();
    if (!res?.authorization_url) {
      toast.error('Get telegram authorization url failed!');
      setLoading(false);
      return;
    }

    if (!res?.bot_id) {
      toast.error('Get telegram bot id failed!');
      setLoading(false);
      return;
    }

    const { origin } = location;
    openAuthWindow(
      appendQueryParamsToUrl(res.authorization_url, {
        bot_id: res.bot_id,
        origin: origin,
        return_to: origin,
        request_access: 'write',
      }),
    );
    startWatch();
    window.addEventListener('message', onTelegramMessage);
    dialogWindowRef.current?.focus();
    checkTelegramAuthWindowClose(res);
  }

  async function onTelegramMessage(event: MessageEvent) {
    let data: { event: string; result: TelegramLoginData };

    try {
      if (typeof event.data === 'string') {
        console.log('onTelegramMessage event data: ', event.data);
        data = JSON.parse(event.data);
      } else if (typeof event.data === 'object') {
        console.log('onTelegramMessage event data object: ', JSON.stringify(event.data));
        data = event.data;
      } else {
        console.log('onTelegramMessage event data: ', event.data);
        throw 'onTelegramMessage Invalid event data!';
      }

      if (data.event === 'auth_result') {
        onTelegramAuthDone(data.result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      window.removeEventListener('message', onTelegramMessage);
      setLoading(false);
    }
  }

  async function onTelegramAuthDone(authData: TelegramLoginData) {
    await connectTelegramAPI(authData);
    callback?.();
  }

  async function checkTelegramAuthWindowClose(options: TelegramAuthDto) {
    if (!loading) return;
    if (!dialogWindowRef.current) return;
    if (!dialogWindowRef.current.window || dialogWindowRef.current.window.closed) {
      try {
        const authData = await getTelegramAuthData(options);
        if (!authData || !authData.user) {
          throw 'checkTelegramAuthWindowClose get telegram auth data failed';
        }

        console.log('checkTelegramAuthWindowClose: ', authData.user);
        onTelegramAuthDone(authData.user);
      } catch (e) {
        console.log(e);
      } finally {
        window.removeEventListener('message', onTelegramMessage);
        setLoading(false);
        return;
      }
    }

    setTimeout(checkTelegramAuthWindowClose, 100, options);
  }

  async function onConnect() {
    if (!userInfo) {
      console.log('connect no userInfo');
      toggleLoginModal(true);
      return;
    }

    if (type === MediaType.EMAIL) {
      console.log('connect email');
      toggleLoginModal(true, true);
      return;
    }

    if (type === MediaType.METAMASK) {
      if (isConnected) {
        await onConnectWallet();
        callback?.();
      } else {
        open();
        startWatch();
      }

      return;
    }

    if (type === MediaType.TELEGRAM) {
      await onTelegramConnect();
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
    startWatch();
    setLoading(false);
  }

  useEffect(() => {
    return () => {
      stopWatch();
    };
  }, []);

  const BindTipsModal = () => {
    return (
      <Modal
        placement="center"
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{ base: 'bg-[#141414] rounded-base max-w-[40rem]' }}
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              <div className="flex flex-col" style={{ paddingTop: '3rem', paddingBottom: '2.5rem' }}>
                <p>
                  We have detected an account connection conflict. This occurs when an attempt is made to link a
                  platform that is already connected to another account.
                </p>
                <br />
                <p>To resolve this, please follow these steps:</p>
                <br />
                <p style={{ textIndent: '1em' }}>
                  1. Log in with the platform that is currently linked to the conflicting account.
                </p>
                <p style={{ textIndent: '1em' }}>
                  2. Go to [User Center], and disconnect the platform account causing the conflict.
                </p>
                <p style={{ textIndent: '1em' }}>
                  3. Wait for 12 hours before attempting to reconnect. This cooldown period helps us maintain platform
                  integrity and prevent abusive practices.
                </p>
                <p style={{ textIndent: '1em' }}>
                  4. After 12 hours, log in again and link the account you wish to use.
                </p>
                <br />
                <p>
                  If you encounter any issues, please contact our{' '}
                  <a className="text-basic-yellow hover:underline" href="https://discord.gg/moonveil">
                    support team
                  </a>{' '}
                  for assistance.
                </p>

                <div className="mt-4 flex justify-center">
                  <LGButton actived label="Close" onClick={onClose} />
                </div>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    );
  };

  return { isConnected, address, onConnect, loading, BindTipsModal };
}
