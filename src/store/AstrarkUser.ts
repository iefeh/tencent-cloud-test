import { KEY_LOCALE, Locale } from '@/constant/locale';
import { KEY_AUTHORIZATION_AA } from '@/constant/storage';
import { confirmSignUpAPI } from '@/http/services/login';
import { makeAutoObservable } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { createContext, useContext } from 'react';

enableStaticRendering(typeof window === 'undefined');

let clientStore: UserStore;

const initStore = () => {
  const store = clientStore ?? new UserStore();

  if (typeof window === 'undefined') return store;
  if (!clientStore) clientStore = store;
  return store;
};

export function useStore() {
  return initStore();
}

class UserStore {
  inited = false;
  locale = '';
  token = '';

  constructor() {
    makeAutoObservable(this);
  }

  setToken = (val?: string) => {
    this.token = val || '';
    if (val) {
      localStorage.setItem(KEY_AUTHORIZATION_AA, val);
    } else {
      localStorage.removeItem(KEY_AUTHORIZATION_AA);
    }
  };

  init = () => {
    this.token = localStorage.getItem(KEY_AUTHORIZATION_AA) || '';
    this.inited = true;
  };

  setLocale = (val?: Locale) => {
    this.locale = val || Locale.EN;
    localStorage.setItem(KEY_LOCALE, this.locale);
  };
}

export default UserStore;

export const UserContext = createContext<UserStore>(new UserStore());

export function useAAUserContext() {
  return useContext(UserContext);
}
