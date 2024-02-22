import { KEY_AUTHORIZATION, KEY_INVITE_CODE, KEY_PARTICLE_TOKEN, KEY_SIGN_UP_CRED } from '@/constant/storage';
import { getWorldTimeAPI } from '@/http/services/common';
import {
  confirmSignUpAPI,
  connectByEmailAPI,
  getUserInfoAPI,
  loginByEmailAPI,
  logoutAPI,
  signInParticleAPI,
} from '@/http/services/login';
import { ParticleNetwork } from '@particle-network/auth';
import dayjs, { Dayjs } from 'dayjs';
import { throttle } from 'lodash';
import { makeAutoObservable } from 'mobx';
import { toast } from 'react-toastify';

class UserStore {
  token = '';
  userInfo: UserInfo | null = null;
  jwtToken = '';
  particle: ParticleNetwork;
  loginModalVisible = false;
  inviteModalVisible = false;
  // timerLoading = false;
  // hasGotTime = false;
  // expired = true;
  // timer = 0;
  isConnect = false;
  newUserModalVisible = false;

  constructor() {
    makeAutoObservable(this);
    this.particle = new ParticleNetwork({
      projectId: '6e3c69f1-f726-405a-8277-93542a2e602d',
      clientKey: 'cqTW7Q9qUDlZOhZ0uTiwDYP3BidmCrx2eWlNHzSZ',
      appId: 'f9d66501-274a-4a88-9848-5749641693d6',
    });
  }

  init = () => {
    this.token = localStorage.getItem(KEY_AUTHORIZATION) || '';
    if (this.token) this.getUserInfo();

    // this.getCurrentTime();
    // this.timer = window?.setInterval(this.getCurrentTime, 60000);
  };

  // getCurrentTime = async () => {
  //   this.timerLoading = true;

  //   try {
  //     const res = await getWorldTimeAPI();
  //     let time: Dayjs;

  //     if (res) {
  //       time = dayjs(res.timestamp);
  //     } else {
  //       time = dayjs(Date.now());
  //     }

  //     const expiredTime = dayjs(+(process.env.NEXT_PUBLIC_WHITELIST_EXPIRE_TIME || 0) || 1706072400000);
  //     this.expired = time.isAfter(expiredTime);
  //     this.hasGotTime = true;
  //   } catch (error) {
  //     this.expired = false;
  //   } finally {
  //     this.timerLoading = false;
  //   }
  // };

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

    this.loginParticle().catch((error: any) => toast.error(error.message || error));
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
    if (this.particle.auth.isLogin()) {
      this.particle.auth.logout(true);
    }

    if (needRequest) {
      await logoutAPI();
    }

    this.token = '';
    localStorage.removeItem(KEY_AUTHORIZATION);
    this.setUserInfo(null);
  };

  getParticleUserInfo = async () => {
    let userInfo;
    if (!this.particle.auth.isLogin()) {
      console.log('particle not login, use jwt: ', this.jwtToken);
      userInfo = await this.particle.auth.login({
        preferredAuthType: 'jwt',
        account: this.jwtToken,
        hideLoading: true,
      });
    } else {
      userInfo = this.particle.auth.getUserInfo();
    }

    return userInfo;
  };

  loginParticle = async () => {
    const particleUserInfo = await this.getParticleUserInfo();
    console.log("particle user info(return when it's null): ", particleUserInfo);
    if (!particleUserInfo) return;

    const { token, uuid } = particleUserInfo!;
    console.log('particle has logged in, token: ', token);
    console.log('particle has logged in, uuid: ', uuid);

    const data: ParticleAuthDto = {
      particle_auth_token: token,
      particle_user_id: uuid,
      platform: 'web',
    };

    console.log('particle report request, token: ', token);
    const res = await signInParticleAPI(data);
    return res;
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
}

export default UserStore;
