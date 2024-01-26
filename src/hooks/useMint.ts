import contractABI from '@/http/abi.json';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import useConnect from './useConnect';
import { MediaType } from '@/constant/task';
import { throttle } from 'lodash';
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';
import { useContext, useEffect, useRef, useState } from 'react';
import { MintContext } from '@/pages/NFT/Mint';
import { MintState } from '@/constant/mint';
import { toast } from 'react-toastify';
import { MobxContext } from '@/pages/_app';

export default function useMint() {
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
    setNowCount,
    setGRCount,
    setFRCount,
    reset,
  } = useContext(MintContext);
  const [mintCount, setMintCount] = useState('0');
  const { address } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { isConnected, onConnect } = useConnect(
    MediaType.METAMASK,
    () => {
      toggleIsConnected(isConnected);
    },
    true,
  );

  const provider = useRef(new BrowserProvider(walletProvider!));
  const signer = useRef<JsonRpcSigner | null>(null);
  const contract = useRef<Contract | null>(null);

  async function initProvider() {
    provider.current = new BrowserProvider(walletProvider!);
    signer.current = await provider.current.getSigner();
    contract.current = new Contract(process.env.NEXT_PUBLIC_MINT_CONTRACT_ADDRESS!, contractABI, signer.current);
  }

  const init = throttle(async function () {
    reset();
    if (!isConnected) return;
    toggleIsConnected(true);

    toggleLoading(true);

    const res = await checkNetwork();
    if (!res) {
      toggleLoading(false);
      return;
    }

    try {
      await initMintState();
    } catch (error: any) {
      toast.error(error?.message || error);
    } finally {
      toggleLoading(false);
    }
  }, 500);

  async function initMintState() {
    try {
      await initProvider();
      const result = await contract.current!.getMintState();
      const res = parseInt(result);
      console.log('mint state', res);
      setState(res || MintState.NotStarted);
    } catch (error: any) {
      toast.error(error?.message || error);
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
      toast.error(error.message);
      toggleIsConnected(false);
      return false;
    }
  }

  async function switchNetwork() {
    try {
      await walletProvider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + parseInt(process.env.NEXT_PUBLIC_MINT_NETWORK_CHAIN_ID!).toString(16) }],
      });
      await initProvider();
      init();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function checkWhitelist() {
    try {
      const result = await contract.current!.nowMintQual(address);
      const res = parseInt(result);
      setNowCount(res);
      console.log('now mint count:', res);
      toggleIsWhitelistChecked(true);
    } catch (error: any) {
      toast.error(error.message);
    }

    if (!isEnded && !canMint) {
      checkWhitelistByRound(MintState.GuaranteedRound);
      checkWhitelistByRound(MintState.FCFS_Round);
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
      toast.error(error.message);
    }
  }

  const mint = throttle(async () => {
    const transaction = await contract.current!.mint(mintCount);
    const result = await transaction.wait();
    console.log('mint result:', result);
    toggleMinted(true);
    await checkWhitelist();
  }, 500);

  async function onButtonClick() {
    if (!isWalletConnected) {
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

    if (!isWhitelistChecked) {
      await checkWhitelist();
      toggleLoading(false);
      return;
    }

    await mint();
    toggleLoading(false);
  }

  useEffect(() => {
    init();
  }, [userInfo]);

  return { mintCount, setMintCount, onButtonClick };
}
