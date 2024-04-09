import { InviteMilestone, queryInviteMilestoneAPI } from '@/http/services/invite';
import { throttle } from 'lodash';
import { makeAutoObservable } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';

enableStaticRendering(typeof window === 'undefined');

let clientStore: InviteStore;

const initStore = () => {
  const store = clientStore ?? new InviteStore();

  if (typeof window === 'undefined') return store;
  if (!clientStore) clientStore = store;
  return store;
};

export function useInviteStore() {
  return initStore();
}

class InviteStore {
  milestone: InviteMilestone | null = null;
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setMilestone(val: InviteMilestone | null) {
    this.milestone = val;
  }

  setLoading(val: boolean) {
    this.loading = val;
  }

  init = throttle(async () => {
    this.setLoading(true);
    const res = await queryInviteMilestoneAPI();
    this.setMilestone(res || null);
    this.setLoading(false);
  }, 10000);
}

export default InviteStore;
