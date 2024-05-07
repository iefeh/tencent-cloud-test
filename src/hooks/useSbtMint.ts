import { throttle } from 'lodash';
import { useRef, useState } from 'react';
import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { MintPermit } from '@/http/services/badges';
import { toast } from 'react-toastify';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import sbtContractABI from '@/http/sbt_abi.json';
import { WALLECT_NETWORKS } from '@/constant/mint';
import { parseChainIdToHex } from './utils';

export default function useSbtMint() {
  const { walletProvider } = useWeb3ModalProvider();
  const provider = useRef(new BrowserProvider(walletProvider!));
  const signer = useRef<JsonRpcSigner | null>(null);
  const contract = useRef<Contract | null>(null);
  const { address, isConnected } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);
  const [isNetCorrected, setIsNetCorrected] = useState(false);

  function toastError(error: any, step = '') {
    console.log('nft error', step, error);
    toast.error(error?.reason || error?.data?.message || error?.message || error);
  }

  async function initProvider() {
    provider.current = new BrowserProvider(walletProvider!);
    signer.current = await provider.current.getSigner();
    contract.current = new Contract(process.env.NEXT_PUBLIC_MINT_CONTRACT_ADDRESS!, sbtContractABI, signer.current);
  }

  async function checkNetwork(targetChainId: string) {
    try {
      const network = await provider.current.getNetwork();
      const chainId = network.chainId;
      const isNetCorrected = chainId.toString() === targetChainId;
      setIsNetCorrected(isNetCorrected);
      console.log('current mint network chainId:', chainId);
      return isNetCorrected;
    } catch (error: any) {
      toastError(error, 'checkNetwork');
      return false;
    }
  }

  async function addNetwork(targetChainId: string) {
    try {
      const network = WALLECT_NETWORKS[targetChainId!];
      if (!network) throw Error('Please try switching network manually.');

      const res = await walletProvider?.request({
        method: 'wallet_addEthereumChain',
        params: [network],
      });
      console.log('connected network', res);
      return true;
    } catch (error: any) {
      toastError(error, 'addNetwork');
      return false;
    }
  }

  async function switchNetwork(targetChainId: string) {
    try {
      await walletProvider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: parseChainIdToHex(targetChainId) }],
      });
      await initProvider();
    } catch (error: any) {
      if (error?.code === 4902 || error?.code === 5000) {
        // 未添加此网络，添加后自动唤起切换
        const res = await addNetwork(targetChainId);
        if (res) {
          await switchNetwork(targetChainId);
        }
      } else {
        toastError(error, 'switchNetwork');
      }
    }
  }

  const mint = throttle(async (permit: MintPermit) => {
    try {
      const transaction = await contract.current!.mint(permit);
      const result = await transaction.wait();
      console.log('mint result:', result);
    } catch (error: any) {
      toastError(error, 'mint');
    }
  }, 500);

  async function onButtonClick(targetChainId: string, permit: MintPermit) {
    if (!isConnected) {
      open();
      return;
    }

    setLoading(true);

    if (!isNetCorrected) {
      const res = await checkNetwork(targetChainId);
      if (!res) {
        await switchNetwork(targetChainId);
      }
      setLoading(false);
      return;
    }

    await mint(permit);
    setLoading(false);
  }

  return { onButtonClick };
}
