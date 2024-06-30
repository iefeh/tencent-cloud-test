import { WALLECT_NETWORKS } from '@/constant/mint';
import { parseChainIdToHex } from '@/hooks/utils';
import { Eip1193Provider } from 'ethers';

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
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: parseChainIdToHex(targetChainId) }],
    });
    return true;
  } catch (error: any) {
    if (error?.code === 4902 || error?.code === 5000) {
      // 未添加此网络，添加后自动唤起切换
      const res = await addNetwork(provider, targetChainId);
      if (!res) return false;
      return await switchNetwork(provider, targetChainId);
    } else {
      console.log('switchNetwork', error);
      console.dir(error);
    }
  }

  return false;
}
