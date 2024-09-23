import { useEffect, useState } from "react";
import { getBalanceOf, getCurrentBalance, getCurrentNetwork, getCurrentAccount } from "@/utils/wallet";
import { Eip1193Provider } from 'ethers';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { isHexZero } from "@/utils/common";

interface WalletInfo {
  walletAddress: string | undefined;
  network: string | undefined;
  balance: string | undefined;
}

interface WalletInfoProps {
  provider: Eip1193Provider | undefined;
  contractAddress?: string;
  open?: boolean;
}

const useWalletInfo = (props: WalletInfoProps) => {
  const { provider, contractAddress, open } = props;
  const { isConnected } = useWeb3ModalAccount();

  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    walletAddress: undefined,
    network: undefined,
    balance: undefined,
  });

  const getBalance = async () => {
    if (!provider || !contractAddress) return

    const useOrigin = isHexZero(contractAddress)
    let balance: string = '0'
    if (useOrigin) {
      balance = await getCurrentBalance(provider)
    } else {
      balance = await getBalanceOf(provider, contractAddress)
    }
    
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
    await getAddress()
    await getBalance()
    await getNetwork()
  }

  useEffect(() => {
    if (isConnected && open) {
      getInfo()
    }
  }, [isConnected, open])

  useEffect(() => {
    if (!open) {
      setWalletInfo({
        walletAddress: undefined,
        network: undefined,
        balance: undefined,
      })
    }
  }, [open])

  return { walletInfo, getInfo };
}

export default useWalletInfo;