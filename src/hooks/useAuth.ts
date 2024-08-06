import { throttle } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { MediaType } from '@/constant/task';
import { loginByMediaAPI, loginByWalletAPI, loginByTelegramAPI } from '@/http/services/login';
import { TelegramLoginData } from '@/http/services/login';
import { toast } from 'react-toastify';
import { KEY_AUTHORIZATION, KEY_AUTHORIZATION_AUTH, KEY_PARTICLE_TOKEN, KEY_SIGN_UP_CRED } from '@/constant/storage';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider } from 'ethers';
import { MobxContext } from '@/pages/_app';
import useWatchStorage from './useWatchStorage';

export default function useAuth(type: string, callback?: (args?: any) => void) {
  const store = useContext(MobxContext);
  const dialogWindowRef = useRef<Window | null>(null);
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const authConnect = throttle(function () {
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_AUTH) || {};
    if (!tokens[type]) return;
    const { code, msg, signup_cred } = tokens[type] || {};
    console.log(232432, type, code, msg);
    if (+code !== 1) {
      toast.error(msg);
    }
    delete tokens[type];
    localStorage.save(KEY_AUTHORIZATION_AUTH, tokens);

    if (signup_cred) {
      localStorage.setItem(KEY_SIGN_UP_CRED, signup_cred || '');
      store.toggleNewUserModal();
    } else {
      store.initLoginInfo();
      callback?.();
    }

    if (!dialogWindowRef.current) return;
    dialogWindowRef.current.close();
    dialogWindowRef.current = null;
  }, 500);

  const { startWatch, stopWatch } = useWatchStorage({ key: KEY_AUTHORIZATION_AUTH, callback: authConnect });

  function openAuthWindow(authURL: string) {
    setTimeout(() => {
      const dialog = window.open(
        authURL,
        'Authrization',
        'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
      );
      dialogWindowRef.current = dialog;
      dialog?.addEventListener('close', () => {
        dialogWindowRef.current = null;
      });
    }, 0);
  }

  async function onConnectWallet() {
    setLoading(true);
    const message = `Please confirm that you are the owner of this wallet by signing this message.\nSigning this message is safe and will NOT trigger any blockchain transactions or incur any fees.\nTimestamp: ${Date.now()}`;
    const provider = new BrowserProvider(walletProvider!);

    let res: TokenDto | null = null;
    try {
      const signer = await provider.getSigner();
      const signature = await signer?.signMessage(message);

      const data = {
        address: address as `0x${string}`,
        message,
        signature,
        signup_mode: 'enabled',
      };
      res = await loginByWalletAPI(data);
    } catch (error: any) {
      console.log(error);
    }

    if (!res) throw new Error('Login Failed');

    const { token, particle_jwt, signup_cred } = res || {};
    localStorage.setItem(KEY_AUTHORIZATION, token);
    localStorage.setItem(KEY_PARTICLE_TOKEN, particle_jwt);
    if (signup_cred) {
      store.toggleNewUserModal(true);
      localStorage.setItem(KEY_SIGN_UP_CRED, signup_cred || '');
      throw new Error('Is New User');
    } else {
      try {
        await store.initLoginInfo();
      } catch (error) {}
    }

    setLoading(false);
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
        const res = await loginByTelegramAPI(data.result);
        if (!res) throw new Error('Login Failed');

        const { token, particle_jwt, signup_cred } = res || {};
        localStorage.setItem(KEY_AUTHORIZATION, token);
        localStorage.setItem(KEY_PARTICLE_TOKEN, particle_jwt);
        if (signup_cred) {
          store.toggleNewUserModal(true);
          localStorage.setItem(KEY_SIGN_UP_CRED, signup_cred || '');
          throw new Error('Is New User');
        } else {
          await store.initLoginInfo();
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function onConnect() {
    if (type === MediaType.EMAIL) {
      return;
    }

    if (type === MediaType.METAMASK) {
      if (isConnected) {
        try {
          await onConnectWallet();
          callback?.();
        } catch (error) {
          console.log(error);
        }
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
    const res = await loginByMediaAPI(type);
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

  return { onConnect, loading };
}
