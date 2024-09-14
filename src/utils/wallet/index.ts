import { WALLECT_NETWORKS } from '@/constant/mint';
import { parseChainIdToHex } from '@/hooks/utils';
import { BrowserProvider, Eip1193Provider } from 'ethers';
import { toast } from 'react-toastify';

export async function getCurrentAccount(provider: Eip1193Provider) {
  try {
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
      params: [],
    });
    return accounts[0];
  } catch (error) {
    console.log('getCurrentAccount', error);
    console.dir(error);
    return false;
  }
}

export async function getCurrentBalance(provider: Eip1193Provider) {
  const currentAccount = await getCurrentAccount(provider);
  const bp = new BrowserProvider(provider);
  const balance = await bp.getBalance(currentAccount);
  return balance.toString();
}

async function addNetwork(provider: Eip1193Provider, targetChainId: number | string) {
  try {
    const network = WALLECT_NETWORKS[targetChainId!];
    if (!network) throw Error('Please try switching network manually.');

    const res = await provider.request({
      method: 'wallet_addEthereumChain',
      params: [network],
    });
    console.log('add network', res);
    return true;
  } catch (error: any) {
    console.log('addNetwork', error);
    console.dir(error);
    return false;
  }
}

export async function switchNetwork(provider: Eip1193Provider, targetChainId: number | string): Promise<boolean> {
  try {
    const currentChainId = await provider.request({ method: 'eth_chainId', params: []});
    if (currentChainId.toString() === targetChainId.toString()) return true;

    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: parseChainIdToHex(targetChainId) }],
    });
    return true;
  } catch (error: any) {
    if (error?.code === -32603 || error?.code === 4902 || error?.code === 5000) {
      // 未添加此网络，添加后自动唤起切换
      const res = await addNetwork(provider, targetChainId);
      if (!res) return false;
      return await switchNetwork(provider, targetChainId);
    } else {
      console.log('switchNetwork', error);
      console.dir(error);
      return false;
    }
  }

  return false;
}

export async function handleWalletExecutionError(error?: InformableError) {
  const msg = error?.message || '';
  let tips = '';

  if (msg.toLowerCase().indexOf('execution reverted:') > -1) {
    tips = msg.match(/execution reverted\:\s*"([^"]+)"/)?.[1] || '';
  }

  toast.error(tips || 'Transaction failed, please try again later.');
}

export async function getCurrentNetwork(provider: Eip1193Provider) {
  const currentChainId = await provider.request({ method: 'eth_chainId', params: []});
  const network = WALLECT_NETWORKS[currentChainId!];

  return network.chainName || ''
}
