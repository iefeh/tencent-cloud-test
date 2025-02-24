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
  1: {
    chainId: parseChainIdToHex('1'),
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://ethereum-rpc.publicnode.com'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  11155111: {
    chainId: parseChainIdToHex('11155111'),
    chainName: 'Ethereum Sepolia Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
  // More Test
  1093502521: {
    chainId: parseChainIdToHex('1093502521'),
    chainName: 'Moonveil Testnet',
    nativeCurrency: {
      name: 'MORE',
      symbol: 'MORE',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.testnet.moonveil.gg/'],
    blockExplorerUrls: ['https://blockscout.testnet.moonveil.gg/'],
  },
};
