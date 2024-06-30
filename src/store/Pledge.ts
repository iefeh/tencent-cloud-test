import { BrowserProvider, Eip1193Provider, Contract } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';
import pledgeABI from '@/http/abi/pledge.json';
import { PoolProps, PoolType } from '@/constant/pledge';

class PledgeStore {
  currentType: PoolType = PoolType.USDT;
  poolInfos: Dict<Partial<Pledge.PoolInfo>> = {
    [PoolType.USDT]: [],
    [PoolType.USDC]: [],
    [PoolType.ETH]: [],
  };

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentType = (val: PoolType) => (this.currentType = val);

  setPoolInfo = (key: string, val: Pledge.PoolInfo | []) => {
    this.poolInfos = {
      ...this.poolInfos,
      [key]: val,
    };
  };

  get currentPoolInfo() {
    return this.poolInfos[this.currentType] || [];
  }

  queryPoolInfo = async (provider: Eip1193Provider, type: PoolType) => {
    const bp = new BrowserProvider(provider);
    const signer = await bp.getSigner();
    try {
      const contract = new Contract(process.env.NEXT_PUBLIC_PLEDGE_CONTRACT_STAKE!, pledgeABI, signer);
      const { id } = PoolProps[type];
      const res = await contract.pools(id);
      console.log('queryPoolInfo res', id, res);
      this.setPoolInfo(type, res || []);
    } catch (error) {
      console.log('queryPoolInfo error:', error);
      console.dir(error);
      return null;
    }
  };

  initPoolInfo = (provider: Eip1193Provider) => {
    this.queryPoolInfo(provider, PoolType.USDT);
    this.queryPoolInfo(provider, PoolType.USDC);
    this.queryPoolInfo(provider, PoolType.ETH);
  };
}

export default PledgeStore;

export const PledgeContext = createContext<PledgeStore>(new PledgeStore());

export function usePledgeContext() {
  return useContext(PledgeContext);
}
