import { BattleInfoDTO, BattlePassLevelDTO, queryBattleInfoAPI } from '@/http/services/battlepass';
import { throttle } from 'lodash';
import { makeAutoObservable } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { createContext, useContext } from 'react';

enableStaticRendering(typeof window === 'undefined');

let clientStore: BattlePassStore;

const initStore = () => {
  const store = clientStore ?? new BattlePassStore();

  if (typeof window === 'undefined') return store;
  if (!clientStore) clientStore = store;
  return store;
};

export function useBattlePassStore() {
  return initStore();
}

class BattlePassStore {
  private lastEl = 0;
  info: BattleInfoDTO | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get finalPass(): BattlePassLevelDTO | undefined {
    const { standard_pass = [], premium_pass = [] } = this.info || {};
    const finalPass = standard_pass[standard_pass.length - 1] || premium_pass[premium_pass.length - 1];
    return finalPass;
  }

  get hasAcheivedFinalPass() {
    const { satisfied_time } = this.finalPass || {};
    return !!satisfied_time;
  }

  setInfo = (data: BattleInfoDTO | null) => (this.info = data);

  init = throttle(async (force = false) => {
    const now = performance.now();
    if (!force && now - this.lastEl < 5000) return;

    const res = await queryBattleInfoAPI();
    this.setInfo(res);
    this.lastEl = performance.now();
  }, 500);
}

export default BattlePassStore;

export const BattlePassContext = createContext<BattlePassStore>(new BattlePassStore());

export function useBattlePassContext() {
  return useContext(BattlePassContext);
}
