import { useUserContext } from '@/store/User';
import TransactionProvider, { type TransactionParams } from '@/utils/wallet/transaction';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  abi: any;
  method: string;
}

export default function useTransaction({ abi, method }: Props) {
  const { userInfo, toggleLoginModal } = useUserContext();
  const { walletProvider } = useWeb3ModalProvider();
  const { isConnected } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);
  const txProvider = useRef<TransactionProvider>();
  const isConnectedRef = useRef<boolean>(isConnected);

  async function onTransaction(params: TransactionParams) {
    const { passLogin = false } = params;
    
    if (!userInfo && !passLogin) {
      toggleLoginModal(true);
      return;
    }

    if (!isConnected) {
      open();
      return;
    }

    if (!txProvider.current) return;

    setLoading(true);
    const res = await txProvider.current.transaction(params);
    setLoading(false);
    return res;
  }

  const beReady = async (chain_id: string) => {
    if (!isConnected) {
      open();
      return;
    }

    try {
      const res = await txProvider.current?.beReady(chain_id);
      return res;
    } catch (error) {
      console.log('useTransaction beReady', error);
      return false
    }
  }

  const reqToCheckIsConnected = async (cb: () => void, date = new Date().valueOf()) => {
    if (isConnectedRef.current) return cb();

    const maxWaitTime = 1 * 60 * 1000;
    if (new Date().valueOf() - date > maxWaitTime) {
      return 
    }
    requestAnimationFrame(() => reqToCheckIsConnected(cb))
  }

  useEffect(() => {
    if (isConnected && walletProvider) {
      txProvider.current = new TransactionProvider({
        provider: walletProvider,
        config: {
          abi,
          method,
        },
      });
    } else {
      txProvider.current = undefined;
    }
  }, [walletProvider, isConnected]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected])

  return { loading, onTransaction, beReady, reqToCheckIsConnected };
}
