import { BrowserProvider, Eip1193Provider, Contract, formatUnits, parseUnits, JsonRpcSigner } from 'ethers';
import type { BigNumberish } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';
import pledgeABI from '@/http/abi/pledge.json';
import erc20ABI from '@/http/abi/erc20.json';
import { PoolProps, PoolType } from '@/constant/pledge';
import { handleWalletExecutionError } from '@/utils/wallet';
import { queryTokenPriceAPI } from '@/http/services/pledge';
import BN from 'bignumber.js';

const ALL_POOL_TYPES = [PoolType.USDT, PoolType.USDC, PoolType.ETH];

interface RpcOperator {
  provider: Eip1193Provider;
  bp: BrowserProvider;
  signer: JsonRpcSigner;
  contract: Contract;
}

function getDefaultPrice(type: PoolType) {
  return type === PoolType.ETH ? '0' : '1';
}

class PledgeStore {
  currentType: PoolType = PoolType.USDT;
  poolInfos: Dict<Partial<Pledge.PoolInfo>> = {
    [PoolType.USDT]: [],
    [PoolType.USDC]: [],
    [PoolType.ETH]: [],
  };
  stakeInfo: Partial<Pledge.UserStakeInfo> = [];
  stakeInfos: Dict<Partial<Pledge.UserStakeInfo>> = {
    [PoolType.USDT]: [],
    [PoolType.USDC]: [],
    [PoolType.ETH]: [],
  };

  stakeOperator?: RpcOperator;
  erc20Operators: Dict<RpcOperator | null> = {
    [PoolType.USDT]: null,
    [PoolType.USDC]: null,
    [PoolType.ETH]: null,
  };
  prices: Dict<string> = {
    [PoolType.USDT]: getDefaultPrice(PoolType.USDT),
    [PoolType.USDC]: getDefaultPrice(PoolType.USDC),
    [PoolType.ETH]: getDefaultPrice(PoolType.ETH),
  };

  currentBalance = 0n;

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

  setStakeInfos = (key: string, val: Pledge.UserStakeInfo | []) => {
    this.stakeInfos = {
      ...this.stakeInfos,
      [key]: val,
    };
  };

  setStakeInfo = (val: Partial<Pledge.UserStakeInfo>) => (this.stakeInfo = val || []);

  setCurrentBalance = (val: bigint) => (this.currentBalance = val);

  get currentPoolInfo() {
    return this.poolInfos[this.currentType] || [];
  }

  get currentPoolData() {
    const totalValue = this.formatUnits(this.currentPoolInfo[2]?.toString());

    return {
      totalValue,
      totalDollar: this.calcPoolTotalDollar(this.currentType),
    };
  }

  get poolsTotalValue() {
    const total = Object.keys(this.poolInfos).reduce((p, c) => p.plus(this.calcPoolTotalDollar(c as PoolType)), BN(0));

    return total.eq(0) ? '-' : total.toFixed(2);
  }

  get totalLocked() {
    const now = Date.now();

    const res = (this.stakeInfo[4] || []).reduce((p, c) => {
      if (c[6] !== 0n || c[1] * 1000n <= BigInt(now)) return p;
      return p + c[0];
    }, 0n);

    return res;
  }

  get totalStakingPoints() {
    const total = Object.values(this.stakeInfos).reduce((p, c) => p + (c[2] || 0n), 0n);

    return total;
  }

  get currentErc20Operator() {
    return this.erc20Operators[this.currentType];
  }

  queryCurrentBalance = async (provider: Eip1193Provider, address: string) => {
    try {
      await this.satisfyErc20Operator(provider);
      const res = await this.currentErc20Operator!.contract.balanceOf(address);
      this.setCurrentBalance(res || 0n);
    } catch (error) {
      console.log('queryCurrentBalance error:', error);
      console.dir(error);
      return null;
    }
  };

  calcPoolTotalDollar = (type: PoolType) => {
    const info = this.poolInfos[type];
    const value = formatUnits(info[2]?.toString() || '0', info[1]);
    const price = this.prices[type] || '0';

    return BN(value).times(BN(price));
  };

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

  satisfyErc20Operator = async (provider: Eip1193Provider, type = this.currentType) => {
    if (type === PoolType.ETH) return;
    if (this.erc20Operators[type]?.provider === provider) return;

    const contractAddress = PoolProps[this.currentType]?.contract || '';
    if (!contractAddress) return;
    const bp = new BrowserProvider(provider);
    const signer = await bp.getSigner();
    const contract = new Contract(contractAddress, erc20ABI, signer);
    this.erc20Operators = {
      ...this.erc20Operators,
      [type]: {
        provider,
        bp,
        signer,
        contract,
      },
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

  initPrice = async (type: PoolType) => {
    const token = PoolProps[type]?.token;
    if (!token) return;
    const res = await queryTokenPriceAPI({ token });
    this.prices = {
      ...this.prices,
      [type]: res?.price || getDefaultPrice(type),
    };
  };

  initPoolInfo = (provider: Eip1193Provider) => {
    ALL_POOL_TYPES.forEach((type) => {
      this.queryPoolInfo(provider, type);
      this.initPrice(type);
    });
  };

  initUserStakeInfos = (provider: Eip1193Provider, user: string, force = false) => {
    ALL_POOL_TYPES.forEach((type) => {
      if (!force && type !== this.currentType && this.stakeInfos[type]?.length > 0) return;
      this.queryUserStakeInfo(provider, user, type);
    });
  };

  queryUserStakeInfo = async (provider: Eip1193Provider, user: string, type = this.currentType) => {
    try {
      await this.satisfyStakeOperator(provider);
      const { id } = PoolProps[type];
      const res = await this.stakeOperator!.contract.getUserPoolStake(user, id);
      console.log('queryUserStakeInfo res', id, res);
      if (type === this.currentType) this.setStakeInfo(res);
      this.setStakeInfos(type, res);
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
      await this.currentErc20Operator!.contract.approve(id);
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
    this.initUserStakeInfos(provider, user, true);
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
