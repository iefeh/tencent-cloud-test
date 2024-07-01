import { useUserContext } from '@/store/User';
import { switchNetwork } from '@/utils/wallet';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

let lastTimestamp = 0;

export default function useWallet() {
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const { userInfo, toggleLoginModal } = useUserContext();
  const isMyWallectConnected = address?.toLowerCase() === userInfo?.wallet?.toLowerCase();
  const { walletProvider } = useWeb3ModalProvider();
  const pledgeChainId = process.env.NEXT_PUBLIC_PLEDGE_CHAIN_ID!;
  const isChainCorrected = chainId === +pledgeChainId;
  const connected = isConnected && isChainCorrected && isMyWallectConnected;

  async function onConnect() {
    const now = performance.now();
    if (now - lastTimestamp < 500) return;

    lastTimestamp = now;

    if (!userInfo) {
      toggleLoginModal(true);
      return;
    }

    if (!isConnected) {
      open();
      return;
    }

    if (!isChainCorrected) {
      if (!walletProvider) return;
      const res = await switchNetwork(walletProvider, pledgeChainId);
      if (!res) return;
    }

    if (!isMyWallectConnected) {
      toast.error(
        'Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.',
      );
      return;
    }
  }

  useEffect(() => {
    if (!isConnected) return;
    onConnect();
  }, [isConnected]);

  return {
    connectLabel: isConnected ? (isChainCorrected ? 'Wrong Wallet' : 'Switch Network') : 'Connect Wallet',
    connected,
    address,
    onConnect,
  };
}
