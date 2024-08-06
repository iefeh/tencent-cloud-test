import { throttle } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { MediaType } from '@/constant/task';
import { connectMediaAPI, connectWalletAPI, connectTelegramAPI } from '@/http/services/login';
import { TelegramLoginData } from '@/http/services/login';
import { toast } from 'react-toastify';
import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider } from 'ethers';
import { MobxContext } from '@/pages/_app';
import { Modal, ModalContent, ModalBody, useDisclosure } from '@nextui-org/react';
import LGButton from '@/pages/components/common/buttons/LGButton';
import useWatchStorage from './useWatchStorage';

export default function useConnect(type: string, callback?: (args?: any) => void) {
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const dialogWindowRef = useRef<Window | null>(null);
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const bindTipsDisclosure = useDisclosure();

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
        bindTipsDisclosure.onOpen();
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
        window.removeEventListener('message', onTelegramMessage);
        await connectTelegramAPI(data.result);
        callback?.();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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
    if (type === MediaType.TELEGRAM) {
      window.addEventListener('message', onTelegramMessage);
      return;
    }

    setLoading(false);
  }

  useEffect(() => {
    return () => {
      stopWatch();
    };
  }, []);

  return { isConnected, address, onConnect, loading, bindTipsDisclosure };
}
