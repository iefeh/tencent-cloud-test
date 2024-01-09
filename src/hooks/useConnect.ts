import { useContext, useEffect, useRef, useState } from 'react';
import { MediaType } from '@/constant/task';
import { connectMediaAPI, connectWalletAPI } from '@/http/services/login';
import { toast } from 'react-toastify';
import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider } from 'ethers';
import { MobxContext } from '@/pages/_app';

export default function useConnect(type: string, callback?: (args?: any) => void) {
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const dialogWindowRef = useRef<Window | null>(null);
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  function authConnect() {
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_CONNECT) || {};
    if (!tokens[type]) return;
    dialogWindowRef.current?.close();
    dialogWindowRef.current = null;
    const { code, msg } = tokens[type] || {};
    if (+code === 1) {
      callback?.();
    } else {
      toast.error(msg);
    }
    delete tokens[type];
    localStorage.save(KEY_AUTHORIZATION_CONNECT, tokens);
  }

  function openAuthWindow(authURL: string) {
    const dialog = window.open(
      authURL,
      'Authrization',
      'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
    );
    dialogWindowRef.current = dialog;
    dialog?.addEventListener('close', () => {
      dialogWindowRef.current = null;
    });
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

  return { onConnect, loading };
}
