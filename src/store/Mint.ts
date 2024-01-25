import { MintState } from '@/constant/mint';
import { makeAutoObservable } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { StaticImageData } from 'next/image';
import nft1Img from 'img/nft/whitelist/cover.jpg';
import emptyNFTImg from 'img/nft/mint/nft_empty.jpg';

enableStaticRendering(typeof window === 'undefined');

let clientStore: MintStore;

const initStore = () => {
  const store = clientStore ?? new MintStore();

  if (typeof window === 'undefined') return store;
  if (!clientStore) clientStore = store;
  return store;
};

export function useStore() {
  return initStore();
}

interface MintInfo {
  buttonDisabled?: boolean;
  buttonLabel: string;
  nftImg: string | StaticImageData;
}

class MintStore {
  isConnected = false;
  isNetCorrected = false;
  isWhitelistChecked = false;
  state = MintState.Ended;

  /** 当前mint资格数 */
  nowCount = 0;

  /** 第一轮mint资格数 */
  grCount = 0;

  /** 第二轮mint资格数 */
  frCount = 0;

  mintNo = 3597;
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  get isReady() {
    return this.isConnected && this.isNetCorrected && this.isWhitelistChecked;
  }

  get canMint() {
    return (
      this.state === MintState.GuaranteedRound ||
      this.state === MintState.FCFS_Round ||
      this.state === MintState.PublicRound
    );
  }

  get mintInfo(): MintInfo {
    if (!this.isConnected) {
      return {
        buttonLabel: 'Connect Wallet',
        nftImg: emptyNFTImg,
      };
    }

    if (!this.isNetCorrected) {
      return {
        buttonLabel: 'Switch Network',
        nftImg: emptyNFTImg,
      };
    }

    if (!this.isWhitelistChecked) {
      return {
        buttonLabel: 'Check Whitelist',
        nftImg: emptyNFTImg,
      };
    }

    switch (this.state) {
      case MintState.Ended:
        return {
          buttonLabel: 'Check Whitelist',
          nftImg: emptyNFTImg,
        };
      case MintState.GuaranteedRound:
      case MintState.FCFS_Round:
      case MintState.PublicRound:
        return {
          buttonLabel: 'Mint Now',
          nftImg: nft1Img,
        };
      case MintState.NotStarted:
      case MintState.Pausing:
        return {
          buttonDisabled: true,
          buttonLabel: 'Mint Now',
          nftImg: nft1Img,
        };
    }
  }

  setState = (val: number | typeof NaN) => {
    this.state = Number.isNaN(val) ? MintState.Ended : Math.min(val, MintState.Ended);
  };

  setNowCount = (val: number | typeof NaN) => {
    this.nowCount = val || 0;
  };

  toggleIsConnected = (val?: boolean) => {
    this.isConnected = typeof val === 'boolean' ? val : !this.isConnected;
  };

  toggleIsNetCorrected = (val?: boolean) => {
    this.isNetCorrected = typeof val === 'boolean' ? val : !this.isNetCorrected;
  };

  toggleIsWhitelistChecked = (val?: boolean) => {
    this.isWhitelistChecked = typeof val === 'boolean' ? val : !this.isWhitelistChecked;
  };
}

export default MintStore;
