import { KEY_AUTHORIZATION } from '@/constant/storage';
import { getUserInfoAPI, loginByEmailAPI, logoutAPI, signInParticleAPI } from '@/http/services/login';
import { ParticleNetwork } from '@particle-network/auth';
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
    this.loginParticle();
  };

  logout = async (needRequest = true) => {
    if (needRequest) {
      await logoutAPI();
    }

    this.token = '';
    localStorage.removeItem(KEY_AUTHORIZATION);
    this.userInfo = null;
  };

  getParticleUserInfo = async () => {
    const particle = new ParticleNetwork({
      projectId: '6e3c69f1-f726-405a-8277-93542a2e602d',
      clientKey: 'cqTW7Q9qUDlZOhZ0uTiwDYP3BidmCrx2eWlNHzSZ',
      appId: 'f9d66501-274a-4a88-9848-5749641693d6',
    });

    let userInfo;
    if (!particle.auth.isLogin()) {
      userInfo = await particle.auth.login();
    } else {
      userInfo = particle.auth.getUserInfo();
    }

    return userInfo;
  };

  loginParticle = async () => {
    if (!this.userInfo) return;

    const particleUserInfo = await this.getParticleUserInfo();
    if (!particleUserInfo) return;

    const { token, uuid } = particleUserInfo;

    const data: ParticleAuthDto = {
      particle_auth_token: token,
      particle_user_id: uuid,
      platform: 'web',
    };

    const res = await signInParticleAPI(data);
    return res;
  };
}

export default UserStore;
