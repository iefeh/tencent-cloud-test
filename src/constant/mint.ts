import { parseChainIdToHex } from '@/hooks/utils';

export const enum MintStatus {
  DEFAULT,
  CONNECTED,
  WRONG_NETWORK,
  CORRECTED_NETWORK,
  WRONG_WHITELISTED,
  WHITELISTED,
  WRONG_MINTED,
  MINTED,
  SOLD_OUT,
}

export const enum MintState {
  NotStarted,
  Pausing,
  GuaranteedRound,
  FCFS_Round,
  PublicRound,
  Ended,
}

interface NetworkInfo {
  chainId: `0x${string}`;
  chainName: string;
  nativeCurrency: {
    name?: string;
    symbol: string;
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const CURRENT_CHAIN_ID = '0x' + parseInt(process.env.NEXT_PUBLIC_MINT_NETWORK_CHAIN_ID!).toString(16);

export const MINT_CONTRACTS: { [key: string]: string } = {
  80001: '0x0e36f9b27f225be9ba135c512158432e037106a7',
};

export const WALLECT_NETWORKS: { [key: string]: NetworkInfo } = {
  80001: {
    chainId: parseChainIdToHex('80001'),
    chainName: 'Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
};
