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
  80002: {
    chainId: parseChainIdToHex('80002'),
    chainName: 'Amoy',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com'],
  },
  137: {
    chainId: parseChainIdToHex('137'),
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
};
