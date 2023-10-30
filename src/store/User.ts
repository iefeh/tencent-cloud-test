import { KEY_AUTHORIZATION } from '@/constant/storage';
import { getUserInfoAPI, loginByEmailAPI, logoutAPI } from '@/http/services/login';
import { makeAutoObservable } from 'mobx';

class UserStore {
  token = '';
  userInfo: UserInfo | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  init = () => {
    this.token = localStorage.getItem(KEY_AUTHORIZATION) || '';
    if (this.token) this.getUserInfo();
  };

  loginByEmail = async (data: LoginByEmailBodyDto) => {
    const res = await loginByEmailAPI(data);
    this.token = res.token || '';
    localStorage.setItem(KEY_AUTHORIZATION, this.token);
    await this.getUserInfo();
  };

  getUserInfo = async () => {
    const res = await getUserInfoAPI();
    this.userInfo = res;
  };

  logout = async (needRequest = true) => {
    if (needRequest) {
      await logoutAPI();
    }

    this.token = '';
    localStorage.removeItem(KEY_AUTHORIZATION);
    this.userInfo = null;
  };

  
}

export default UserStore;
