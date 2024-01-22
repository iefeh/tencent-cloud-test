import { MintStatus } from '@/constant/mint';
import { makeAutoObservable } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { StaticImageData } from 'next/image';
import nft1Img from 'img/nft/whitelist/cover.jpg';
import emptyNFTImg from 'img/nft/mint/nft_empty.jpg';
import { delay, divide, throttle } from 'lodash';

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
  buttonLabel: string;
  nftImg: string | StaticImageData;
}

class MintStore {
  status = MintStatus.DEFAULT;
  count = 0;
  mintNo = 3597;
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  get mintInfo(): MintInfo {
    if (this.status >= MintStatus.WHITELISTED) {
      return {
        buttonLabel: 'Mint Now',
        nftImg: nft1Img,
      };
    } else if (this.status >= MintStatus.CORRECTED_NETWORK) {
      return {
        buttonLabel: 'Check Whitelist',
        nftImg: emptyNFTImg,
      };
    } else if (this.status >= MintStatus.CONNECTED) {
      return {
        buttonLabel: 'Switch Network',
        nftImg: emptyNFTImg,
      };
    } else {
      return {
        buttonLabel: 'Connect Wallet',
        nftImg: emptyNFTImg,
      };
    }
  }

  onMintOperation = throttle(async () => {
    if (this.status >= MintStatus.WHITELISTED) {
      this.loading = true;
      delay(() => {
        this.loading = false;
        this.status = MintStatus.MINTED;
      }, 500);
    } else if (this.status >= MintStatus.CORRECTED_NETWORK) {
      this.status = MintStatus.WHITELISTED;
    } else if (this.status >= MintStatus.CONNECTED) {
      this.status = MintStatus.CORRECTED_NETWORK;
    } else {
      this.status = MintStatus.CONNECTED;
    }
  }, 500);
}

export default MintStore;
