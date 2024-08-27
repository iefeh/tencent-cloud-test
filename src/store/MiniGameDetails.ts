import { queryGameTicketsAPI, queryMiniGameDetailsAPI } from '@/http/services/minigames';
import type { MiniGames } from '@/types/minigames';
import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';

let clientStore: MiniGameDetailsStore;

const initStore = () => {
  const store = clientStore ?? new MiniGameDetailsStore();

  if (typeof window === 'undefined') return store;
  if (!clientStore) clientStore = store;
  return store;
};

export function useMGDStore() {
  return initStore();
}

class MiniGameDetailsStore {
  loading = false;
  id: string = '';
  data: MiniGames.GameDetailDTO | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setId = (val: string) => (this.id = val);
  setLoading = (val: boolean) => (this.loading = val);

  setData = (val: MiniGames.GameDetailDTO | null) => {
    this.data = val;
  };

  queryDetails = async (id: string = this.id) => {
    if (!id) {
      this.setId('');
      this.setData(null);
      return;
    }

    this.setLoading(true);

    const res = await queryMiniGameDetailsAPI({ client_id: id });
    this.setData(res || null);
    this.setId(res.client_id || '');

    this.setLoading(false);
  };

  queryTickets = async (id: string = this.id) => {
    if (!id) {
      this.setId('');
      this.setData(null);
      return;
    }

    const res = await queryGameTicketsAPI({ game_id: id });
    if (!res) return;
    const ticket = { remain: res.available_tickets || 0 };
    if (!this.data) return;
    this.setData({ ...this.data, ticket });
  };
}

export default MiniGameDetailsStore;

export const MGDContext = createContext<MiniGameDetailsStore>(new MiniGameDetailsStore());

export function useMGDContext() {
  return useContext(MGDContext);
}
