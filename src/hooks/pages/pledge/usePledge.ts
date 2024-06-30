import { useWeb3ModalProvider } from '@web3modal/ethers/react';
import { useEffect } from 'react';
import useWallet from '@/hooks/useWallet';
import { usePledgeContext } from '@/store/Pledge';

export default function usePledge() {
  const { connected, address } = useWallet();
  const { walletProvider } = useWeb3ModalProvider();
  const { currentType, initPoolInfo, queryUserStakeInfo } = usePledgeContext();

  useEffect(() => {
    if (!walletProvider) return;
    initPoolInfo(walletProvider);
  }, [walletProvider]);

  useEffect(() => {
    if (!connected || !walletProvider || !address) return;
    queryUserStakeInfo(walletProvider, address);
  }, [connected, currentType]);

  return { connected };
}
