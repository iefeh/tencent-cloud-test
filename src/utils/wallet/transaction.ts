import { WALLECT_NETWORKS } from '@/constant/mint';
import { parseChainIdToHex } from '@/hooks/utils';
import { Contract, BrowserProvider, type Eip1193Provider, type TransactionRequest } from 'ethers';
import { toast } from 'react-toastify';

interface ContractProviderConfig {
  provider: Eip1193Provider;
  config?: Partial<TransactionConfig>;
}

export interface TransactionParams {
  /** 跳过登录检测 */
  passLogin?: boolean;
  params: any;
  config?: Partial<TransactionConfig>;
  options?: TransactionRequest;
  onError?: (code?: number, message?: string) => boolean | undefined;
}

export interface TransactionConfig {
  abi: any;
  method: string;
  chainId: string | number;
  contractAddress: string;
}

class TransactionProvider {
  bp!: BrowserProvider;
  config?: Partial<TransactionConfig>;

  constructor({ provider, config }: ContractProviderConfig) {
    this.bp = new BrowserProvider(provider);
    this.config = config;
  }

  getCurrentAccount = async () => {
    try {
      const accounts = (await this.bp.send('eth_requestAccounts', [])) as unknown as string[];
      return accounts[0];
    } catch (error) {
      console.log('getCurrentAccount', error);
      console.dir(error);
      return false;
    }
  };

  getCurrentBalance = async () => {
    const currentAccount = await this.getCurrentAccount();
    if (!currentAccount) return null;

    try {
      const balance = await this.bp.getBalance(currentAccount);
      return balance.toString();
    } catch (error) {
      console.log('getCurrentBalance', error);
      console.dir(error);
      return null;
    }
  };

  addNetwork = async (targetChainId: number | string) => {
    try {
      const network = WALLECT_NETWORKS[targetChainId];
      if (!network) throw Error('Please try switching network manually.');

      const res = await this.bp.send('wallet_addEthereumChain', [network]);
      console.log('add network', res);
      return true;
    } catch (error: any) {
      console.log('addNetwork', error);
      console.dir(error);
      return false;
    }
  };

  getCurrentChainId = async () => {
    try {
      const currentChainId = await this.bp.send('eth_chainId', []);
      return currentChainId;
    } catch (error) {
      console.log('getCurrentChainId', error);
      console.dir(error);
      return null;
    }
  };

  switchNetwork = async (targetChainId: number | string): Promise<boolean> => {
    const currentChainId = await this.getCurrentChainId();
    if (currentChainId.toString() === targetChainId.toString()) return true;

    try {
      await this.bp.send('wallet_switchEthereumChain', [{ chainId: parseChainIdToHex(targetChainId) }]);
      return true;
    } catch (e: any) {
      let error = e?.error || e;
      const code = Math.abs(error?.code || 0);
      if (code === 32603 || code === 4902 || code === 5000) {
        // 未添加此网络，添加后自动唤起切换
        const res = await this.addNetwork(targetChainId);
        if (!res) return false;
        return await this.switchNetwork(targetChainId);
      } else {
        console.log('switchNetwork', error);
        console.dir(error);
        return false;
      }
    }
  };

  beReady = async (chainId = this.config?.chainId) => {
    if (!chainId) return false;

    const account = await this.getCurrentAccount();
    if (!account) return false;

    const networkRes = await this.switchNetwork(chainId);
    if (!networkRes) return false;

    return true;
  };

  transaction = async ({ params, config = {}, options = {}, onError }: TransactionParams) => {
    const realConfig = Object.assign({}, this.config, config);
    const { abi, method, chainId, contractAddress } = realConfig;
    console.log('transaction config:', realConfig);
    if (!abi || !method || !chainId || !contractAddress) return false;

    const res = await this.beReady(chainId);
    if (!res) return false;

    try {
      const signer = await this.bp.getSigner();
      const contract = new Contract(contractAddress, abi, signer);
      console.log('transaction method:', method);
      console.log('transaction params:', params);
      console.log('transaction options:', options);
      let transaction: any;
      if (params instanceof Array) {
        transaction = await contract[method](...params, options);
      } else {
        transaction = await contract[method](params, options);
      }
      const result = await transaction.wait();
      console.log('transaction result:', result);
      return result;
    } catch (error: any) {
      console.log('transaction', error);
      console.dir(error);

      const code = error?.info?.error?.code || error?.error?.code || error?.code;
      const message = error?.message || error?.error?.message || error?.info?.error?.message;

      let showDefaultTips = !onError;
      if (onError) {
        showDefaultTips = !onError(+code, message?.toString?.()?.toLowerCase());
      }

      if (showDefaultTips) {
        toast.error('Transaction failed, please try again later.');
      }

      return null;
    }
  };
}

export default TransactionProvider;
