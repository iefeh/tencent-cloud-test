import { throttle } from 'lodash';
import { useRef, useState } from 'react';
import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { MintPermitResDTO } from '@/http/services/badges';
import { toast } from 'react-toastify';
import { useWalletInfo, useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import sbtContractABI from '@/http/sbt_abi.json';
import { WALLECT_NETWORKS } from '@/constant/mint';
import { parseChainIdToHex } from './utils';
import { captureEvent, captureException, type Event } from '@sentry/nextjs';
import { useUserContext } from '@/store/User';

export default function useSbtMint() {
  const { userInfo } = useUserContext();
  const { walletProvider } = useWeb3ModalProvider();
  const signer = useRef<JsonRpcSigner | null>(null);
  const { isConnected } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);
  const { walletInfo } = useWalletInfo();

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

  async function getAccounts(provider: BrowserProvider) {
    try {
      const accounts = (await provider.send('eth_requestAccounts', [])) as unknown as string[];
      return accounts;
    } catch (error) {
      captureException(error, { data: 'eth_requestAccounts' });
      console.log('connect error:', error);
    }
  }

  async function checkNetwork(provider: BrowserProvider, targetChainId: string) {
    let chainId: any;

    try {
      const network = await provider.getNetwork();
      chainId = network.chainId;
      const isNetCorrected = chainId.toString() === targetChainId;
      console.log('current mint network chainId:', chainId);
      return isNetCorrected;
    } catch (error: any) {
      captureException(error, { data: { message: 'checkNetwork', chainId, targetChainId } });
      toastError(error, 'checkNetwork');
      return false;
    }
  }

  async function addNetwork(provider: BrowserProvider, targetChainId: string) {
    try {
      const network = WALLECT_NETWORKS[targetChainId!];
      if (!network) throw Error('Please try switching network manually.');

      const res = await provider.send('wallet_addEthereumChain', [network]);
      console.log('connected network', res);
      return true;
    } catch (error: any) {
      captureException(error, { data: { message: 'addNetwork', chainId: targetChainId } });
      toastError(error, 'addNetwork');
      return false;
    }
  }

  async function switchNetwork(provider: BrowserProvider, targetChainId: string): Promise<boolean> {
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: parseChainIdToHex(targetChainId) }]);
      return true;
    } catch (error: any) {
      captureException(error, { data: { message: 'switchNetwork', chainId: targetChainId } });
      if (error?.code === 4902 || error?.code === 5000) {
        // 未添加此网络，添加后自动唤起切换
        const res = await addNetwork(provider, targetChainId);
        if (!res) return false;
        return await switchNetwork(provider, targetChainId);
      } else {
        toastError(error, 'switchNetwork');
      }
    }

    return false;
  }

  const mint = throttle(async (provider: BrowserProvider, data: MintPermitResDTO): Promise<string | undefined> => {
    try {
      signer.current = await provider.getSigner();
      const contract = new Contract(data.contract_address, sbtContractABI, signer.current);
      const transaction = await contract.mint(data.permit);
      const result = await transaction.wait();
      console.log('mint result:', result);
      return result;
    } catch (error: any) {
      captureException(error, { data: { message: 'mint' } });
      // toastError(error, 'mint');
      toast.error('Transaction failed, please try again later.');
    }
  }, 500);

  function captureMintEvent(e: Event) {
    const { message, ...rest } = e;
    e.message = `sbt_mint ${JSON.stringify(rest)}`;
    captureEvent(e);
  }

  async function onButtonClick(data: MintPermitResDTO) {
    const errorEvent = {
      message: 'sbt_mint',
      userId: userInfo?.user_id,
      isConnected: false,
      hasPermission: false,
      networkOk: false,
      switchedNetwork: false,
      sendMint: false,
      walletType: walletInfo?.name || '',
    };

    if (!isConnected) {
      open();
      captureMintEvent(errorEvent);
      return;
    }

    errorEvent.isConnected = true;
    setLoading(true);

    const provider = new BrowserProvider(walletProvider!);
    const accounts = await getAccounts(provider);
    if (!accounts || accounts.length < 1) {
      captureMintEvent(errorEvent);
      return false;
    }

    errorEvent.hasPermission = true;

    const res = await checkNetwork(provider, data.chain_id);
    if (!res) {
      const switchRes = await switchNetwork(provider, data.chain_id);
      if (!switchRes) {
        captureMintEvent(errorEvent);
        setLoading(false);
        return;
      }
      errorEvent.switchedNetwork = true;
    }

    errorEvent.networkOk = true;

    const result = await mint(provider, data);
    errorEvent.sendMint = true;
    setLoading(false);

    if (!result) {
      captureMintEvent(errorEvent);
    }

    return !!result;
  }

  return { loading, onButtonClick };
}
