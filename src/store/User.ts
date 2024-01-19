import { KEY_AUTHORIZATION, KEY_INVITE_CODE } from '@/constant/storage';
import {
  connectByEmailAPI,
  getUserInfoAPI,
  loginByEmailAPI,
  logoutAPI,
  signInParticleAPI,
} from '@/http/services/login';
import { ParticleNetwork } from '@particle-network/auth';
import { debounce } from 'lodash';
import { makeAutoObservable } from 'mobx';

class UserStore {
  token = '';
  userInfo: UserInfo | null = null;
  jwtToken = '';
  particle: ParticleNetwork;
  loginModalVisible = false;
  inviteModalVisible = false;
  isConnect = false;

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
  };

  setUserInfo = (userInfo: UserInfo | null) => {
    this.userInfo = userInfo;
  };

  loginByEmail = async (data: LoginByEmailBodyDto) => {
    const api = this.isConnect ? connectByEmailAPI : loginByEmailAPI;
    const res = await api(data);
    this.token = res.token || '';
    this.jwtToken = res.particle_jwt || '';
    localStorage.setItem(KEY_AUTHORIZATION, this.token);
    this.loginParticle();
    await this.getUserInfo();
  };

  getUserInfo = debounce(async () => {
    const res = await getUserInfoAPI();
    this.setUserInfo(res);

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
}

export default UserStore;
