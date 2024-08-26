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
  80002: {
    chainId: parseChainIdToHex('80002'),
    chainName: 'Amoy',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [process.env.RPC_URL_80002!],
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
    rpcUrls: [process.env.RPC_URL_137!],
    blockExplorerUrls: ['https://polygonscan.com'],
  }
};

function parseChainIdToHex(val: string | number): `0x${string}` {
  return `0x${(+val).toString(16)}`;
}