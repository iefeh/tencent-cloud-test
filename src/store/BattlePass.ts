import { BattleInfoDTO, queryBattleInfoAPI } from '@/http/services/battlepass';
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

  setInfo = (data: BattleInfoDTO | null) => (this.info = data);

  init = throttle(async () => {
    const now = performance.now();
    if (now - this.lastEl < 5000) return;

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
