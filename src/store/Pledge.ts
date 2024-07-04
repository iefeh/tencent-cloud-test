import { BrowserProvider, Eip1193Provider, Contract, formatUnits, parseUnits, JsonRpcSigner } from 'ethers';
import type { BigNumberish } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';
import pledgeABI from '@/http/abi/pledge.json';
import erc20ABI from '@/http/abi/erc20.json';
import { PoolProps, PoolType } from '@/constant/pledge';
import { handleWalletExecutionError } from '@/utils/wallet';

interface RpcOperator {
  provider: Eip1193Provider;
  bp: BrowserProvider;
  signer: JsonRpcSigner;
  contract: Contract;
}

class PledgeStore {
  currentType: PoolType = PoolType.USDT;
  poolInfos: Dict<Partial<Pledge.PoolInfo>> = {
    [PoolType.USDT]: [],
    [PoolType.USDC]: [],
    [PoolType.ETH]: [],
  };
  stakeInfo: Partial<Pledge.UserStakeInfo> = [];

  stakeOperator?: RpcOperator;
  erc20Operator?: RpcOperator;

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

  get currentPoolData() {
    const [token, decimal, totalStaked] = this.currentPoolInfo;

    return {
      totalValue: `$${this.formatUnits(totalStaked?.toString())}`,
    };
  }

  get poolsTotalValue() {
    const total = Object.values(this.poolInfos).reduce((p, c) => (p += +formatUnits(c[2] || 0n, c[1])), 0);

    return total.toFixed(5).replace(/(\.[0-9]*[1-9])0*$/, '$1');
  }

  satisfyStakeOperator = async (provider: Eip1193Provider) => {
    if (this.stakeOperator?.provider === provider) return;

    const bp = new BrowserProvider(provider);
    const signer = await bp.getSigner();
    const contract = new Contract(process.env.NEXT_PUBLIC_PLEDGE_CONTRACT_STAKE!, pledgeABI, signer);
    this.stakeOperator = {
      provider,
      bp,
      signer,
      contract,
    };
  };

  satisfyErc20Operator = async (provider: Eip1193Provider) => {
    if (this.erc20Operator?.provider === provider) return;

    const bp = new BrowserProvider(provider);
    const signer = await bp.getSigner();
    const contract = new Contract(process.env.NEXT_PUBLIC_PLEDGE_CONTRACT_USDC!, erc20ABI, signer);
    this.erc20Operator = {
      provider,
      bp,
      signer,
      contract,
    };
  };

  queryPoolInfo = async (provider: Eip1193Provider, type: PoolType = this.currentType) => {
    try {
      await this.satisfyStakeOperator(provider);
      const { id } = PoolProps[type];
      const res = await this.stakeOperator!.contract.pools(id);
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
    try {
      await this.satisfyStakeOperator(provider);
      const { id } = PoolProps[this.currentType];
      const res = await this.stakeOperator!.contract.getUserPoolStake(user, id);
      console.log('queryUserStakeInfo res', id, res);
      this.setStakeInfo(res);
    } catch (error) {
      console.log('queryUserStakeInfo error:', error);
      console.dir(error);
      return null;
    }
  };

  approve = async (provider: Eip1193Provider) => {
    try {
      await this.satisfyErc20Operator(provider);
      const { id } = PoolProps[this.currentType];
      await this.erc20Operator!.contract.approve(id);
      return true;
    } catch (error) {
      console.log('approve error:', error);
      console.dir(error);
      handleWalletExecutionError(error as any);
    }

    return false;
  };

  stake = async (provider: Eip1193Provider, amount: string, lockWeeks: number) => {
    if (this.currentType === PoolType.USDC) {
      const approveRes = await this.approve(provider);
      if (!approveRes) return null;
    }

    const amountVal = this.parseUnits(amount);

    try {
      await this.satisfyStakeOperator(provider);
      const { id } = PoolProps[this.currentType];
      console.log('stake params', id, amountVal, lockWeeks);
      const res = await this.stakeOperator!.contract.stake(id, amountVal, lockWeeks, { value: amountVal });
      console.log('stake res', res);
      return res;
    } catch (error) {
      console.log('stake error:', error);
      console.dir(error);
      handleWalletExecutionError(error as any);
      return null;
    }
  };

  withdraw = async (provider: Eip1193Provider, amount: string) => {
    const amountVal = this.parseUnits(amount);

    try {
      await this.satisfyStakeOperator(provider);
      const { id } = PoolProps[this.currentType];
      console.log('withdraw params', id, amountVal);
      const res = await this.stakeOperator!.contract.withdraw(id, amountVal);
      console.log('withdraw res', res);
      return res;
    } catch (error) {
      console.log('withdraw error:', error);
      console.dir(error);
      handleWalletExecutionError(error as any);
      return null;
    }
  };

  refresh = (provider: Eip1193Provider, user: string) => {
    this.initPoolInfo(provider);
    this.queryUserStakeInfo(provider, user);
  };

  formatUnits = (val?: BigNumberish) => {
    return formatUnits(val?.toString() || '0', this.currentPoolInfo[1]) || '-';
  };

  parseUnits = (val?: BigNumberish) => {
    return parseUnits(val?.toString() || '0', this.currentPoolInfo[1]) || '-';
  };
}

export default PledgeStore;

export const PledgeContext = createContext<PledgeStore>(new PledgeStore());

export function usePledgeContext() {
  return useContext(PledgeContext);
}
