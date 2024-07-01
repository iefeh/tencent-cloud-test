import { throttle } from 'lodash';
import { useRef, useState } from 'react';
import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { MintPermitResDTO } from '@/http/services/badges';
import { toast } from 'react-toastify';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import sbtContractABI from '@/http/sbt_abi.json';
import { WALLECT_NETWORKS } from '@/constant/mint';
import { parseChainIdToHex } from './utils';

export default function useSbtMint() {
  const { walletProvider } = useWeb3ModalProvider();
  const signer = useRef<JsonRpcSigner | null>(null);
  const { isConnected } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);

  function toastError(error: any, step = '') {
    console.log('nft error', step, error);
    let message: string = error?.reason || error?.data?.message || error?.message || error || '';

    switch (step) {
      case 'mint':
        if (message.toLowerCase().indexOf('permit already used') > -1) {
          message = 'You have minted, please wait our confirmation.';
        } else {
          message = 'Transaction failed.';
        }
        break;
    }

    toast.error(message);
  }

  async function getAccounts() {
    try {
      const accounts = (await walletProvider?.request({
        method: 'eth_requestAccounts',
        params: [],
      })) as unknown as string[];
      return accounts;
    } catch (error) {
      console.log('connect error:', error);
    }
  }

  async function checkNetwork(targetChainId: string) {
    try {
      const provider = new BrowserProvider(walletProvider!);
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      const isNetCorrected = chainId.toString() === targetChainId;
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

  async function switchNetwork(targetChainId: string): Promise<boolean> {
    try {
      await walletProvider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: parseChainIdToHex(targetChainId) }],
      });
      return true;
    } catch (error: any) {
      if (error?.code === 4902 || error?.code === 5000) {
        // 未添加此网络，添加后自动唤起切换
        const res = await addNetwork(targetChainId);
        if (!res) return false;
        return await switchNetwork(targetChainId);
      } else {
        toastError(error, 'switchNetwork');
      }
    }

    return false;
  }

  const mint = throttle(async (data: MintPermitResDTO): Promise<string | undefined> => {
    try {
      const provider = new BrowserProvider(walletProvider!);
      signer.current = await provider.getSigner();
      const contract = new Contract(data.contract_address, sbtContractABI, signer.current);
      const transaction = await contract.mint(data.permit);
      const result = await transaction.wait();
      console.log('mint result:', result);
      return result;
    } catch (error: any) {
      // toastError(error, 'mint');
      toast.error('Transaction failed, please try again later.');
    }
  }, 500);

  async function onButtonClick(data: MintPermitResDTO) {
    if (!isConnected) {
      open();
      return;
    }

    setLoading(true);

    const accounts = await getAccounts();
    if (!accounts || accounts.length < 1) return false;

    const res = await checkNetwork(data.chain_id);
    if (!res) {
      const switchRes = await switchNetwork(data.chain_id);
      if (!switchRes) {
        setLoading(false);
        return;
      }
    }

    const result = await mint(data);
    setLoading(false);

    return !!result;
  }

  return { loading, onButtonClick };
}
