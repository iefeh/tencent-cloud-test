import { getCurrentBalance } from '@/utils/wallet';
import { useWeb3ModalProvider } from '@web3modal/ethers/react';
import { useEffect, useState } from 'react';

export default function useBalance() {
  const [balance, setBalance] = useState('0');
  const { walletProvider } = useWeb3ModalProvider();

  async function queryBalance() {
    const res = await getCurrentBalance(walletProvider!);
    setBalance(res);
  }

  useEffect(() => {
    if (!walletProvider) return;
    queryBalance();
  }, [walletProvider]);

  return { balance };
}
