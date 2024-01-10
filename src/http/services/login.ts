import { MediaType, QuestType } from '@/constant/task';
import http from '../index';
import { KEY_INVITE_CODE } from '@/constant/storage';

function getAuthParams(path = '') {
  const { origin } = location;
  const params = {
    landing_url: `${origin}/auth${path}`,
  };

  return params;
}

export function sendEmailCodeAPI(params: SendEmailCodeParamsDto) {
  params.quick_fill_url = `${location.origin}/email/captcha/quickfill`;
  return http.get('/api/auth/signin/captcha', { params });
}

export function loginByEmailAPI(data: LoginByEmailBodyDto): Promise<TokenDto> {
  data.invite_code = localStorage.getItem(KEY_INVITE_CODE) || undefined;
  return http.post('/api/auth/signin/email', JSON.stringify(data));
}

export function getUserInfoAPI(): Promise<UserInfo> {
  return http.get('/api/users/me');
}

export function logoutAPI() {
  return http.post('/api/auth/signout');
}

export function getGoogleAuthLinkAPI(): Promise<AuthDto> {
  return http.get('/api/auth/signin/google', { params: getAuthParams() });
}

export function getTwitterAuthLinkAPI(): Promise<AuthDto> {
  return http.get('/api/auth/signin/twitter', { params: getAuthParams() });
}

export function signInParticleAPI(data: ParticleAuthDto) {
  return http.post('/api/auth/signin/particle', JSON.stringify(data));
}

export function connectMediaAPI(type: string): Promise<AuthDto> {
  return http.get(`/api/auth/connect/${type}`, { params: getAuthParams(`/connect?type=${type}`) });
}

export function loginByMediaAPI(type: string): Promise<AuthDto> {
  return http.get(`/api/auth/signin/${type}`, {
    params: { ...getAuthParams(`?type=${type}`), invite_code: localStorage.getItem(KEY_INVITE_CODE) || undefined },
  });
}

interface WalletReqDto {
  address: string;
  signature: string;
  message: string;
  invite_code?: string;
}

export function loginByWalletAPI(data: WalletReqDto): Promise<TokenDto | null> {
  data.invite_code = localStorage.getItem(KEY_INVITE_CODE) || undefined;
  return http.post('/api/auth/signin/wallet', JSON.stringify(data));
}

export function connectWalletAPI(data: WalletReqDto): Promise<TokenDto | null> {
  return http.post('/api/auth/connect/wallet', JSON.stringify(data));
}

export function disconnectMediaAPI(type: string): Promise<boolean | null> {
  return http.post(`/api/auth/disconnect/${type}`);
}
