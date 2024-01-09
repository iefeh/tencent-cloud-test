import { useContext, useEffect, useRef, useState } from 'react';
import { MediaType } from '@/constant/task';
import { connectMediaAPI, connectWalletAPI, loginByMediaAPI, loginByWalletAPI } from '@/http/services/login';
import { toast } from 'react-toastify';
import { KEY_AUTHORIZATION, KEY_AUTHORIZATION_AUTH, KEY_PARTICLE_TOKEN } from '@/constant/storage';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider } from 'ethers';
import { MobxContext } from '@/pages/_app';

export default function useAuth(type: string, callback?: (args?: any) => void) {
  const store = useContext(MobxContext);
  const { userInfo, getUserInfo, toggleLoginModal } = store;
  const dialogWindowRef = useRef<Window | null>(null);
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  function authConnect() {
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_AUTH) || {};
    if (!tokens[type]) return;
    const { code, msg } = tokens[type] || {};
    if (+code !== 1) {
      toast.error(msg);
    }
    delete tokens[type];
    localStorage.save(KEY_AUTHORIZATION_AUTH, tokens);

    const token = localStorage.getItem(KEY_AUTHORIZATION);
    const jwt = localStorage.getItem(KEY_PARTICLE_TOKEN);
    console.log('token at thirdparty-login callback url search params', token);
    console.log('jwt-token at thirdparty-login callback url search params', jwt);
    if (!token) return;

    store.token = token;
    store.jwtToken = jwt || '';
    store.loginParticle();
    store.getUserInfo()?.catch(() => void 0);

    callback?.();

    if (!dialogWindowRef.current) return;
    dialogWindowRef.current.close();
    dialogWindowRef.current = null;
  }

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

    try {
      const signer = await provider.getSigner();
      const signature = await signer?.signMessage(message);

      const data = {
        address: address as `0x${string}`,
        message,
        signature,
      };
      const res = await loginByWalletAPI(data);
      if (!res) return;
      const { token, particle_jwt, is_new_user } = res || {};
      store.token = token;
      store.jwtToken = particle_jwt;
      localStorage.setItem(KEY_AUTHORIZATION, token);
      localStorage.setItem(KEY_PARTICLE_TOKEN, particle_jwt);
    } catch (error: any) {
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
    const res = await loginByMediaAPI(type);
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

  return { onConnect, loading };
}
