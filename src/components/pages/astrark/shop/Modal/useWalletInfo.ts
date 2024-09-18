import { useEffect, useState } from "react";
import { getCurrentBalance, getCurrentNetwork, getCurrentAccount } from "@/utils/wallet";
import { Eip1193Provider } from 'ethers';

interface WalletInfo {
  walletAddress: string;
  network: string;
  balance: string;
}

interface WalletInfoProps {
  provider: Eip1193Provider | undefined;
}

const useWalletInfo = (props: WalletInfoProps) => {
  const { provider } = props;

  if (!provider) 
    return {
      walletAddress: "",
      network: "",
      balance: ""
    }

  const [walletInfo, setWalletInfo] = useState<WalletInfo>({} as WalletInfo);

  const getBalance = async () => {
    const balance = await getCurrentBalance(provider)
    
    setWalletInfo(c => {
      return {
        ...c,
        balance
      }
    })
  }

  const getAddress = async () => {
    const address = await getCurrentAccount(provider)
    setWalletInfo(c => {
      return {
        ...c,
        walletAddress: address
      }
    })
  }

  const getNetwork = async () => {
    const network = await getCurrentNetwork(provider)
    setWalletInfo(c => {
      return {
        ...c,
        network
      }
    })
  }

  useEffect(() => {
    getBalance()
    getAddress()
    getNetwork()
  }, [])

  return { walletInfo };
}

export default useWalletInfo;