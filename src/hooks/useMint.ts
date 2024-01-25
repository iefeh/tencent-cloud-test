import contractABI from '@/http/abi.json';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import useConnect from './useConnect';
import { MediaType } from '@/constant/task';
import { throttle } from 'lodash';
import { BrowserProvider, Contract } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { MintContext } from '@/pages/NFT/Mint';
import { MintState } from '@/constant/mint';

export default function useMint() {
  const {
    setState,
    isConnected: isWalletConnected,
    isNetCorrected,
    isWhitelistChecked,
    toggleIsConnected,
    toggleIsNetCorrected,
    toggleIsWhitelistChecked,
    setNowCount,
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
  // const CONTRACT_ADDRESS = '0x9CC02a70F307FB94914A9c1DCAB57D9Dbd7AffB1'; // 替换为你的 NFT 智能合约地址
  const CONTRACT_ADDRESS = '0x9d452C3DdDc5562A7FE015dCf25e7D62282C1737';
  // const CONTRACT_ADDRESS = '0xd89C6420A4D3ae6784754B458F50C2cb7f3b43a3';
  
  const provider = new BrowserProvider(walletProvider!);

  const CHAIN_ID = '80001';

  const init = throttle(async function () {
    if (!isConnected) return;
    toggleIsConnected(true);

    const res = await checkNetwork();
    if (!res) return;

    initMintState();
  }, 500);

  async function initMintState() {
    const signer = await provider.getSigner();
    const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);
    const result = await contract.getMintState();
    const res = parseInt(result);
    console.log('mint state', res);
    setState(res);
  }

  async function checkNetwork() {
    const chainId = (await provider.getNetwork()).chainId;
    const isNetCorrected = chainId.toString() === CHAIN_ID;
    toggleIsNetCorrected(isNetCorrected);
    console.log('mint network:', chainId);
    return isNetCorrected;
  }

  async function checkWhitelist() {
    const signer = await provider.getSigner();
    const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);
    const result = await contract.nowMintQual(address);
    const res = parseInt(result);
    setNowCount(res);
    console.log('now mint count:', res);
    toggleIsWhitelistChecked(true);
  }

  async function mint() {
    const signer = await provider.getSigner();

    const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);
    const transaction = await contract.mint();
    const result = await transaction.wait();
    console.log('mint result:', result)
  }

  function onButtonClick() {
    if (!isWalletConnected) {
      onConnect();
      return;
    }

    if (!isNetCorrected) {
      checkNetwork();
      return;
    }

    if (!isWhitelistChecked) {
      checkWhitelist();
      return;
    }

    mint();
  }

  useEffect(() => {
    init();
  }, []);

  return { mintCount, setMintCount, onButtonClick };
}
