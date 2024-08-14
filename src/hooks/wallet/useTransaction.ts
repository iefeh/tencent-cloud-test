import { useUserContext } from '@/store/User';
import TransactionProvider, { type TransactionConfig } from '@/utils/wallet/transaction';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { type TransactionRequest } from 'ethers';
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

  async function onTransaction(params: any, options: TransactionRequest = {}, config: Partial<TransactionConfig>) {
    if (!userInfo) {
      toggleLoginModal(true);
      return;
    }

    if (!isConnected) {
      open();
      return;
    }

    if (!txProvider.current) return;

    setLoading(true);
    await txProvider.current.beReady();
    const res = await txProvider.current.transaction(params, options, config);
    setLoading(false);
    return res;
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

  return { loading, onTransaction };
}
