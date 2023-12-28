'use client';

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

// 1. Get projectId at https://cloud.walletconnect.com
// const projectId = process.env.WALLECT_CONNECT_PROJECT_ID || '';
const projectId = '562e6655551ddfba294ea41b89392a57';

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com',
};

// 3. Create modal
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/'],
};

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet],
  projectId,
});

export function Web3ModalProvider({ children }: { children: JSX.Element }) {
  return children;
}
