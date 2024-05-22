import contractABI from '@/http/abi.json';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import useConnect from './useConnect';
import { MediaType } from '@/constant/task';
import { throttle } from 'lodash';
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';
import { useContext, useEffect, useRef, useState } from 'react';
import { MintContext } from '@/pages/NFT/Mint';
import { CURRENT_CHAIN_ID, MintState, WALLECT_NETWORKS } from '@/constant/mint';
import { toast } from 'react-toastify';
import { MobxContext } from '@/pages/_app';

export default function useMint(contractAddress = process.env.NEXT_PUBLIC_MINT_CONTRACT_ADDRESS!) {
  const { userInfo } = useContext(MobxContext);
  const {
    setState,
    isEnded,
    canMint,
    isConnected: isWalletConnected,
    isNetCorrected,
    isWhitelistChecked,
    toggleIsConnected,
    toggleIsNetCorrected,
    toggleIsWhitelistChecked,
    toggleMinted,
    toggleLoading,
    toggleHasMintError,
    setNowCount,
    setGRCount,
    setFRCount,
    setTxId,
    reset,
  } = useContext(MintContext);
  const [mintCount, setMintCount] = useState('0');
  const { walletProvider } = useWeb3ModalProvider();
  const { isConnected, address, onConnect } = useConnect(MediaType.METAMASK, () => {
    toggleIsConnected(true);
  });

  const provider = useRef(new BrowserProvider(walletProvider!));
  const signer = useRef<JsonRpcSigner | null>(null);
  const contract = useRef<Contract | null>(null);

  async function initProvider() {
    provider.current = new BrowserProvider(walletProvider!);
    signer.current = await provider.current.getSigner();
    contract.current = new Contract(contractAddress, contractABI, signer.current);
  }

  function toastError(error: any, step = '') {
    console.log('nft error', step, error);
    toast.error(error?.reason || error?.data?.message || error?.message || error);
  }

  const init = throttle(async function () {
    console.log('mint contract address:', contractAddress);
    reset();
    if (!isConnected) return;
    toggleIsConnected(true);

    try {
      await initProvider();
    } catch (error) {
      return;
    }

    toggleLoading(true);

    const res = await checkNetwork();
    if (!res) {
      toggleLoading(false);
      return;
    }

    try {
      await initMintState();
      await checkWallet();
    } catch (error: any) {
      toastError(error, 'init initMintState checkWallet');
    } finally {
      toggleLoading(false);
    }
  }, 500);

  async function initMintState() {
    try {
      const result = await contract.current!.getMintState();
      const res = parseInt(result);
      console.log('mint state', res);
      setState(res || MintState.NotStarted);
    } catch (error: any) {
      toastError(error, 'initMintState');
    }
  }

  async function checkNetwork() {
    try {
      const network = await provider.current.getNetwork();
      const chainId = network.chainId;
      const isNetCorrected = chainId.toString() === process.env.NEXT_PUBLIC_MINT_NETWORK_CHAIN_ID;
      toggleIsNetCorrected(isNetCorrected);
      console.log('current mint network chainId:', chainId);
      return isNetCorrected;
    } catch (error: any) {
      toastError(error, 'checkNetwork');
      toggleIsConnected(false);
      return false;
    }
  }

  async function checkWallet(showToast = false) {
    if (!userInfo?.wallet || !address) return false;
    console.log('check wallet address:', userInfo?.wallet, address);
    if (userInfo?.wallet?.toLowerCase() !== address?.toLowerCase()) {
      toggleHasMintError(true);
      if (showToast) {
        toast.error(
          'Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.',
        );
      }
      return false;
    } else {
      toggleHasMintError(false);
      return true;
    }
  }

  async function addNetwork() {
    try {
      const network = WALLECT_NETWORKS[process.env.NEXT_PUBLIC_MINT_NETWORK_CHAIN_ID!];
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

  async function switchNetwork() {
    try {
      await walletProvider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CURRENT_CHAIN_ID }],
      });
      await initProvider();
      await init();
    } catch (error: any) {
      if (error?.code === 4902 || error?.code === 5000) {
        // 未添加此网络，添加后自动唤起切换
        const res = await addNetwork();
        if (res) {
          await switchNetwork();
        }
      } else {
        toastError(error, 'switchNetwork');
      }
    }
  }

  async function checkWhitelist() {
    try {
      const result = await contract.current!.nowMintQual(address);
      const res = parseInt(result);
      setNowCount(res);
      console.log('now mint count:', res);
      toggleIsWhitelistChecked(true);

      if (!isEnded) {
        checkWhitelistByRound(MintState.GuaranteedRound);
        checkWhitelistByRound(MintState.FCFS_Round);
      }
    } catch (error: any) {
      toastError(error, 'checkWhitelist');
    }
  }

  async function checkWhitelistByRound(state: MintState) {
    try {
      const result = await contract.current!.whiteList(address, state);
      const res = parseInt(result);
      switch (state) {
        case MintState.GuaranteedRound:
          setGRCount(res);
          break;
        case MintState.FCFS_Round:
          setFRCount(res);
          break;
      }
      console.log(`mint count - ${state}:`, res);
    } catch (error: any) {
      toastError(error, 'checkWhitelistByRound');
    }
  }

  const mint = throttle(async () => {
    try {
      const transaction = await contract.current!.mint(mintCount);
      const result = await transaction.wait();
      console.log('mint result:', result);
      toggleMinted(true);
      toggleHasMintError(false);
      setTxId(result?.hash || '');
      await checkWhitelist();
    } catch (error: any) {
      toastError(error, 'mint');
      toggleHasMintError(true);
    }
  }, 500);

  const merge = throttle(async (ids: number[]) => {
    try {
      const transaction = await contract.current!.mergeRequest(ids);
      const result = await transaction.wait();
      console.log('merge result:', result);
      return true;
    } catch (error: any) {
      toastError(error, 'merge');
      return false;
    }
  }, 500);

  async function onButtonClick() {
    if (!isWalletConnected || !userInfo?.wallet) {
      onConnect();
      return;
    }

    toggleLoading(true);

    if (!isNetCorrected) {
      const res = await checkNetwork();
      if (!res) {
        await switchNetwork();
      }
      toggleLoading(false);
      return;
    }

    const res1 = await checkWallet(true);
    if (!res1) {
      toggleLoading(false);
      return;
    }

    if (!isWhitelistChecked) {
      await checkWhitelist();
      toggleLoading(false);
      return;
    }

    await mint();
    toggleLoading(false);
  }

  async function verifyMerge() {
    if (!isWalletConnected || !userInfo?.wallet) {
      onConnect();
      return false;
    }

    if (!isNetCorrected) {
      const res = await checkNetwork();
      if (!res) {
        await switchNetwork();
      }
      return false;
    }

    const res1 = await checkWallet(true);
    if (!res1) return false;

    return true;
  }

  useEffect(() => {
    if (!userInfo || !walletProvider) return;
    init();
  }, [userInfo, walletProvider]);

  function reload() {
    window.location.reload();
  }

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on('chainChanged', reload);
    window.ethereum.on('disconnect', reload);
    window.ethereum.on('accountsChanged', reload);

    return () => {
      window.ethereum.removeListener('chainChanged', reload);
      window.ethereum.removeListener('disconnect', reload);
      window.ethereum.removeListener('accountsChanged', reload);
    };
  }, []);

  return { mintCount, setMintCount, onButtonClick, verifyMerge, merge };
}
