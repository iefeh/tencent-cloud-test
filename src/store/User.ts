import { KEY_LOCALE, Locale } from '@/constant/locale';
import { KEY_AUTHORIZATION, KEY_INVITE_CODE, KEY_PARTICLE_TOKEN, KEY_SIGN_UP_CRED } from '@/constant/storage';
import { confirmSignUpAPI, connectByEmailAPI, getUserInfoAPI, loginByEmailAPI, logoutAPI } from '@/http/services/login';
import { MobxContext } from '@/pages/_app';
import { throttle } from 'lodash';
import { makeAutoObservable } from 'mobx';
import { useContext } from 'react';
import { toast } from 'react-toastify';

class UserStore {
  inited = false;
  locale = '';
  token = '';
  userInfo: UserInfo | null = null;
  jwtToken = '';
  loginModalVisible = false;
  inviteModalVisible = false;
  isConnect = false;
  newUserModalVisible = false;
  redeemModalVisible = false;

  constructor() {
    makeAutoObservable(this);
  }

  setToken = (val?: string) => {
    this.token = val || '';
    if (val) {
      localStorage.setItem(KEY_AUTHORIZATION, val);
    } else {
      localStorage.removeItem(KEY_AUTHORIZATION);
    }
  };

  setJWTToken = (val?: string) => {
    this.jwtToken = val || '';
    if (val) {
      localStorage.setItem(KEY_PARTICLE_TOKEN, val);
    } else {
      localStorage.removeItem(KEY_PARTICLE_TOKEN);
    }
  };

  init = () => {
    this.token = localStorage.getItem(KEY_AUTHORIZATION) || '';
    this.inited = true;
    if (this.token) this.getUserInfo();
  };

  setLocale = (val?: Locale) => {
    this.locale = val || Locale.EN;
    localStorage.setItem(KEY_LOCALE, this.locale);
  };

  setUserInfo = (userInfo: UserInfo | null) => {
    this.userInfo = userInfo;
  };

  loginByEmail = async (data: LoginByEmailBodyDto) => {
    const api = this.isConnect ? connectByEmailAPI : loginByEmailAPI;
    const res = await api(data);
    if (!res) throw new Error('Login Failed');

    if (!this.isConnect) {
      localStorage.setItem(KEY_AUTHORIZATION, res.token || '');
      localStorage.setItem(KEY_PARTICLE_TOKEN, res.particle_jwt || '');

      if (res.signup_cred) {
        localStorage.setItem(KEY_SIGN_UP_CRED, res.signup_cred);
        this.toggleNewUserModal(true);
        // 主动中断过程，不修改原有流程
        throw new Error('Is New User');
      }

      this.initLoginInfo();
    } else {
      await this.getUserInfo();
    }
  };

  initLoginInfo = async () => {
    const res = await confirmSignUpAPI();
    if (res) {
      localStorage.setItem(KEY_AUTHORIZATION, res.token || '');
      localStorage.setItem(KEY_PARTICLE_TOKEN, res.particle_jwt || '');
    }

    const token = localStorage.getItem(KEY_AUTHORIZATION) || '';
    const jwtToken = localStorage.getItem(KEY_PARTICLE_TOKEN) || '';
    console.log('token at thirdparty-login callback url search params', token);
    console.log('jwt-token at thirdparty-login callback url search params', jwtToken);
    this.token = token;
    this.jwtToken = jwtToken;
    if (!token) {
      localStorage.removeItem(KEY_AUTHORIZATION);
      localStorage.removeItem(KEY_PARTICLE_TOKEN);
      return;
    }

    await this.getUserInfo();
    this.toggleNewUserModal(false);
  };

  switchAccount = () => {
    this.toggleNewUserModal(false);
    this.toggleLoginModal(true);
    localStorage.removeItem(KEY_AUTHORIZATION);
    localStorage.removeItem(KEY_PARTICLE_TOKEN);
  };

  getUserInfo = throttle(async () => {
    const res = await getUserInfoAPI();
    this.setUserInfo(res);
    this.toggleLoginModal(false);

    // 成功登录后清除邀请码
    localStorage.removeItem(KEY_INVITE_CODE);
  }, 500);

  logout = async (needRequest = true) => {
    if (needRequest) {
      await logoutAPI();
    }

    this.setToken('');
    this.setJWTToken('');
    this.setUserInfo(null);
  };

  toggleLoginModal = (visible?: boolean, isConnect?: boolean) => {
    if (typeof visible === 'boolean') {
      this.loginModalVisible = visible;
    } else {
      this.loginModalVisible = !this.loginModalVisible;
    }

    this.isConnect = isConnect === true;
  };

  toggleInviteModal = (visible?: boolean) => {
    if (typeof visible === 'boolean') {
      this.inviteModalVisible = visible;
    } else {
      this.inviteModalVisible = !this.inviteModalVisible;
    }
  };

  toggleNewUserModal = (visible?: boolean) => {
    if (typeof visible === 'boolean') {
      this.newUserModalVisible = visible;
    } else {
      this.newUserModalVisible = !this.inviteModalVisible;
    }
  };

  toggleRedeemModal = (visible?: boolean) => {
    if (typeof visible === 'boolean') {
      this.redeemModalVisible = visible;
    } else {
      this.redeemModalVisible = !this.redeemModalVisible;
    }
  };
}

export default UserStore;

export function useUserContext() {
  return useContext(MobxContext);
}
