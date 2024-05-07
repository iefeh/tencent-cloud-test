import { MintState } from '@/constant/mint';
import { makeAutoObservable } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { StaticImageData } from 'next/image';
import nft1Img from 'img/nft/whitelist/cover.jpg';
import emptyNFTImg from 'img/nft/mint/nft_empty.jpg';

enableStaticRendering(typeof window === 'undefined');

let clientStore: SbtMintStore;

const initStore = () => {
  const store = clientStore ?? new SbtMintStore();

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

class SbtMintStore {
  isConnected = false;
  isNetCorrected = false;
  isWhitelistChecked = false;
  state = MintState.NotStarted;

  /** 当前mint资格数 */
  nowCount = 0;

  /** 第一轮mint资格数 */
  grCount = 0;

  /** 第二轮mint资格数 */
  frCount = 0;

  minted = false;
  loading = false;

  /** 当前mint的交易id */
  tx_id = '';

  hasMintError = false;

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

  get isEnded() {
    return this.state === MintState.Ended;
  }

  get mintInfo(): MintInfo {
    if (this.isEnded) {
      return {
        buttonDisabled: true,
        buttonLabel: '',
        nftImg: nft1Img,
      };
    }

    const nftImg = this.canMint ? emptyNFTImg : nft1Img;

    if (!this.isConnected) {
      return {
        buttonLabel: 'Connect Wallet',
        nftImg,
      };
    }

    if (!this.isNetCorrected) {
      return {
        buttonLabel: 'Switch Network',
        nftImg,
      };
    }

    if (!this.isWhitelistChecked) {
      return {
        buttonLabel: 'Check Whitelist',
        nftImg,
      };
    }

    return {
      buttonDisabled: !this.canMint,
      buttonLabel: this.canMint && !this.minted ? 'Mint Now' : '',
      nftImg: nft1Img,
    };
  }

  setState = (val: number | typeof NaN) => {
    this.state = Number.isNaN(val) ? MintState.Ended : Math.min(val, MintState.Ended);
  };

  setNowCount = (val: number | typeof NaN) => {
    this.nowCount = val || 0;
  };

  setGRCount = (val: number | typeof NaN) => {
    this.grCount = val || 0;
  };

  setFRCount = (val: number | typeof NaN) => {
    this.frCount = val || 0;
  };

  setTxId = (val: string) => {
    this.tx_id = val;
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

  toggleMinted = (val?: boolean) => {
    this.minted = typeof val === 'boolean' ? val : !this.minted;
  };

  toggleLoading = (val?: boolean) => {
    this.loading = typeof val === 'boolean' ? val : !this.loading;
  };

  toggleHasMintError = (val?: boolean) => {
    this.hasMintError = typeof val === 'boolean' ? val : !this.hasMintError;
  };

  reset = () => {
    this.setState(MintState.NotStarted);
    this.setNowCount(0);
    this.setGRCount(0);
    this.setFRCount(0);
    this.toggleIsConnected(false);
    this.toggleIsNetCorrected(false);
    this.toggleIsWhitelistChecked(false);
    this.toggleMinted(false);
    this.toggleLoading(false);
    this.toggleHasMintError(false);
  };
}

export default SbtMintStore;
