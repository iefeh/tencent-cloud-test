import { BrowserProvider, Eip1193Provider, Contract } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';
import pledgeABI from '@/http/abi/pledge.json';
import erc20ABI from '@/http/abi/erc20.json';
import { PoolProps, PoolType } from '@/constant/pledge';

class PledgeStore {
  currentType: PoolType = PoolType.USDT;
  poolInfos: Dict<Partial<Pledge.PoolInfo>> = {
    [PoolType.USDT]: [],
    [PoolType.USDC]: [],
    [PoolType.ETH]: [],
  };
  stakeInfo: Partial<Pledge.UserStakeInfo> = [];

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

  setStakeInfo = (val: Partial<Pledge.UserStakeInfo>) => (this.stakeInfo = val || []);

  get currentPoolInfo() {
    return this.poolInfos[this.currentType] || [];
  }

  queryPoolInfo = async (provider: Eip1193Provider, type: PoolType = this.currentType) => {
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

  queryUserStakeInfo = async (provider: Eip1193Provider, user: string) => {
    const bp = new BrowserProvider(provider);
    const signer = await bp.getSigner();

    try {
      const contract = new Contract(process.env.NEXT_PUBLIC_PLEDGE_CONTRACT_STAKE!, pledgeABI, signer);
      const { id } = PoolProps[this.currentType];
      const res = await contract.getUserPoolStake(user, id);
      console.log('queryUserStakeInfo res', id, res);
      this.setStakeInfo(res);
    } catch (error) {
      console.log('queryUserStakeInfo error:', error);
      console.dir(error);
      return null;
    }
  };

  approve = async (provider: Eip1193Provider) => {
    const bp = new BrowserProvider(provider);
    const signer = await bp.getSigner();

    try {
      const contract = new Contract(process.env.NEXT_PUBLIC_PLEDGE_CONTRACT_USDC!, erc20ABI, signer);
      const { id } = PoolProps[this.currentType];
      await contract.approve(id);
      return true;
    } catch (error) {
      console.log('approve error:', error);
      console.dir(error);
    }

    return false;
  };

  stake = async (provider: Eip1193Provider, amount: number, lockWeeks: number) => {
    const approveRes = await this.approve(provider);
    if (!approveRes) return null;

    const bp = new BrowserProvider(provider);
    const signer = await bp.getSigner();
    const amountVal = amount;

    try {
      const contract = new Contract(process.env.NEXT_PUBLIC_PLEDGE_CONTRACT_STAKE!, pledgeABI, signer);
      const { id } = PoolProps[this.currentType];
      const res = await contract.stake(id, amountVal, lockWeeks, { value: amountVal });
      console.log('stake res', id, res);
      return res;
    } catch (error) {
      console.log('stake error:', error);
      console.dir(error);
      return null;
    }
  };
}

export default PledgeStore;

export const PledgeContext = createContext<PledgeStore>(new PledgeStore());

export function usePledgeContext() {
  return useContext(PledgeContext);
}
