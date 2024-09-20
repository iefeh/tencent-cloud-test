import { useEffect, useState } from "react";
import { getCurrentBalance, getCurrentNetwork, getCurrentAccount } from "@/utils/wallet";
import { Eip1193Provider } from 'ethers';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';

interface WalletInfo {
  walletAddress: string | undefined;
  network: string | undefined;
  balance: string | undefined;
}

interface WalletInfoProps {
  provider: Eip1193Provider | undefined;
}

const useWalletInfo = (props: WalletInfoProps) => {
  const { provider } = props;
  const { isConnected } = useWeb3ModalAccount();

  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    walletAddress: undefined,
    network: undefined,
    balance: undefined,
  });

  const getBalance = async () => {
    if (!provider) return

    const balance = await getCurrentBalance(provider)
    
    setWalletInfo(c => {
      return {
        ...c,
        balance
      }
    })
  }

  const getAddress = async () => {
    if (!provider) return

    const address = await getCurrentAccount(provider)
    setWalletInfo(c => {
      return {
        ...c,
        walletAddress: address
      }
    })
  }

  const getNetwork = async () => {
    if (!provider) return

    const network = await getCurrentNetwork(provider)
    setWalletInfo(c => {
      return {
        ...c,
        network
      }
    })
  }

  const getInfo =  async () => {
    await getBalance()
    await getAddress()
    await getNetwork()
  }

  useEffect(() => {
    getInfo()
  }, [])

  useEffect(() => {
    if (isConnected) {
      getInfo()
    }
  }, [isConnected])

  return { walletInfo, getInfo };
}

export default useWalletInfo;