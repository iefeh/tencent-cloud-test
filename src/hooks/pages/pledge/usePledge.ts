import { useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider, Contract } from 'ethers';
import pledgeABI from '@/http/abi/pledge.json';
import { intToHex } from '@particle-network/auth';
import { useEffect } from 'react';
import useWallet from '@/hooks/useWallet';
import { usePledgeContext } from '@/store/Pledge';

export default function usePledge() {
  const { connected, address } = useWallet();
  const { walletProvider } = useWeb3ModalProvider();
  const { initPoolInfo } = usePledgeContext();

  async function queryUserStakeInfo(id: number): Promise<Pledge.PoolInfo | null> {
    if (!walletProvider) return null;

    // if (chainId !== id) {
    //   switchNetwork(id);
    //   return null;
    // }

    const provider = new BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    try {
      await walletProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: intToHex(+id) }],
      });
      const contract = new Contract(process.env.NEXT_PUBLIC_PLEDGE_CONTRACT_STAKE!, pledgeABI, signer);
      const transaction = await contract.getUserPoolStake(address, +id);
      const result = await transaction.wait();
      console.log(234234, result);
      return null;
    } catch (error) {
      console.log('queryPoolInfo error:', error);
      console.dir(error);
      return null;
    }
  }

  useEffect(() => {
    if (!walletProvider) return;
    initPoolInfo(walletProvider);
  }, [connected]);

  return { queryUserStakeInfo, connected };
}
