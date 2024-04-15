import { BattleInfoDTO, BattlePassLevelDTO, createBattlePassAPI, queryBattleInfoAPI } from '@/http/services/battlepass';
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
  info: BattleInfoDTO | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get finalPass(): BattlePassLevelDTO | undefined {
    const { is_premium, standard_pass = [], premium_pass = [] } = this.info || {};
    const passList = is_premium ? premium_pass : standard_pass;
    const finalPass = passList[passList.length - 1];
    return finalPass;
  }

  get hasAcheivedFinalPass() {
    const { satisfied_time } = this.finalPass || {};
    return !!satisfied_time;
  }

  get maxAcheviedLv() {
    const { standard_pass = [] } = this.info || {};
    return standard_pass.reduce((p, c) => (p = !!c.satisfied_time ? Math.max(p, +c.lv) : p), 0) + 1;
  }

  get progressInfo() {
    if (this.hasAcheivedFinalPass) {
      return {
        periodProgress: 1,
        totalProgress: 1,
      };
    }

    const { max_lv = 0, current_progress = 0, is_premium, standard_pass = [], premium_pass = [] } = this.info || {};
    const nextLv = max_lv + 1;
    const passList = (is_premium ? premium_pass : standard_pass) || [];
    const currentPass = passList.find((p) => +p.lv === max_lv);
    let nextPass = passList.find((p) => +p.lv === nextLv);
    if (!nextPass) nextPass = currentPass;

    const lastPass = passList[passList.length - 1];
    const mainProgress = +lastPass?.lv > 0 ? max_lv / +lastPass.lv : 0;
    const periodLine = current_progress - +(currentPass?.task_line || 0);
    const periodTargetLine = +(nextPass?.task_line || 0) - +(currentPass?.task_line || 0);
    const periodProgress = periodTargetLine > 0 ? periodLine / periodTargetLine : 0;
    return {
      periodProgress: periodProgress,
      totalProgress: mainProgress + periodProgress * 0.1,
    };
  }

  setInfo = (data: BattleInfoDTO | null) => (this.info = data);

  // force参数用于节流，已弃用，占位
  init = throttle(async (force = false, needCreatePass = false) => {
    let res = await queryBattleInfoAPI();
    if (needCreatePass && !!res.start_time && !res.has_battle_pass) {
      await this.createPass();
      res = await queryBattleInfoAPI();
    }

    this.setInfo(res);
  }, 500);

  createPass = () => {
    return createBattlePassAPI();
  };
}

export default BattlePassStore;

export const BattlePassContext = createContext<BattlePassStore>(new BattlePassStore());

export function useBattlePassContext() {
  return useContext(BattlePassContext);
}
