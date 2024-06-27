import { useUserContext } from '@/store/User';
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { toast } from 'react-toastify';

export default function useWallet() {
  const { address, isConnected } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const { userInfo, toggleLoginModal } = useUserContext();
  const isMyWallectConnected = address?.toLowerCase() === userInfo?.wallet?.toLowerCase();
  const connected = isConnected && isMyWallectConnected;

  async function onConnect() {
    if (!userInfo) {
      toggleLoginModal(true);
      return;
    }

    if (!isConnected) {
      open();
      return;
    }

    if (!isMyWallectConnected) {
      toast.error(
        'Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.',
      );
      return;
    }
  }

  return { connected, address, onConnect };
}
