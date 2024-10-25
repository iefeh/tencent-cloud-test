import { KEY_AUTHORIZATION, KEY_PARTICLE_TOKEN, KEY_SIGN_UP_CRED } from '@/constant/storage';
import { MediaType } from '@/constant/task';
import { connectWalletAPI, loginByWalletAPI } from '@/http/services/login';
import { useUserContext } from '@/store/User';
import { useWalletInfo, useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider } from 'ethers';
import { useEffect, useRef, useState } from 'react';

export default function useWalletAuth({
  isConnect,
  callback,
}: {
  isConnect?: boolean;
  callback?: (args?: any) => void;
}) {
  const store = useUserContext();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { walletInfo } = useWalletInfo();
  const { open } = useWeb3Modal();
  const isWatching = useRef(false);
  const [loading, setLoading] = useState(false);

  async function onConnectWallet() {
    const message = `Please confirm that you are the owner of this wallet by signing this message.\nSigning this message is safe and will NOT trigger any blockchain transactions or incur any fees.\nTimestamp: ${Date.now()}`;
    const provider = new BrowserProvider(walletProvider!);

    let res: TokenDto | null = null;
    try {
      const signer = await provider.getSigner();
      if (isConnect && store.userInfo?.wallet) return;

      const signature = await signer?.signMessage(message);

      const data: any = {
        address: address as `0x${string}`,
        message,
        signature,
      };

      if (!isConnect) {
        data.signup_mode = 'enabled';
      }

      const api = isConnect ? connectWalletAPI : loginByWalletAPI;
      res = await api(data);
    } catch (error: any) {
      console.log(error);
    }

    if (isConnect) return;

    if (!res) throw new Error('Login Failed');

    const { token, particle_jwt, signup_cred } = res || {};
    localStorage.setItem(KEY_AUTHORIZATION, token);
    localStorage.setItem(KEY_PARTICLE_TOKEN, particle_jwt);
    if (signup_cred) {
      store.toggleNewUserModal(true, {
        is_new_user: true,
        login_type: MediaType.METAMASK,
        wallet_type: walletInfo?.name || '',
      });
      localStorage.setItem(KEY_SIGN_UP_CRED, signup_cred || '');
      throw new Error('Is New User');
    } else {
      try {
        await store.initLoginInfo({
          is_new_user: false,
          login_type: MediaType.METAMASK,
          wallet_type: walletInfo?.name || '',
        });
      } catch (error) {}
    }
  }

  async function onWalletAuth() {
    if (!isConnected) {
      open({ view: 'Connect' });
      isWatching.current = true;
      return;
    }

    setLoading(true);

    try {
      await onConnectWallet();
      callback?.();
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!isConnected || !isWatching.current) return;

    isWatching.current = false;
    onWalletAuth();
  }, [isConnected]);

  return { loading, onWalletAuth };
}
