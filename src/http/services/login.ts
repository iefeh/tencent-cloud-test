import { MediaType, QuestType } from '@/constant/task';
import http from '../index';
import { KEY_INVITE_CODE, KEY_SIGN_UP_CRED } from '@/constant/storage';
import { TelegramLoginData } from '@/lib/authorization/provider/telegram';

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

export function sendEmailConnectCodeAPI(params: SendEmailCodeParamsDto) {
  params.quick_fill_url = `${location.origin}/email/captcha/quickfill`;
  return http.get('/api/auth/connect/captcha', { params });
}

export function loginByEmailAPI(data: LoginByEmailBodyDto): Promise<TokenDto> {
  data.invite_code = localStorage.getItem(KEY_INVITE_CODE) || undefined;
  return http.post('/api/auth/signin/email', JSON.stringify(data));
}

export function connectByEmailAPI(data: LoginByEmailBodyDto): Promise<TokenDto> {
  return http.post('/api/auth/connect/email', JSON.stringify(data));
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
  if (type === MediaType.TELEGRAM) {
    return http.get('/api/auth/telegram/auth', { params: getAuthParams(`/connect?type=${type}`) });
  }

  return http.get(`/api/auth/connect/${type}`, { params: getAuthParams(`/connect?type=${type}`) });
}

export function loginByMediaAPI(type: string): Promise<AuthDto> {
  if (type === MediaType.TELEGRAM) {
    return http.get('/api/auth/telegram/auth', {
      params: {
        ...getAuthParams(`?type=${type}`),
        invite_code: localStorage.getItem(KEY_INVITE_CODE) || undefined,
        signup_mode: 'enabled',
      },
    });
  }

  return http.get(`/api/auth/signin/${type}`, {
    params: {
      ...getAuthParams(`?type=${type}`),
      invite_code: localStorage.getItem(KEY_INVITE_CODE) || undefined,
      signup_mode: 'enabled',
    },
  });
}

interface WalletReqDto {
  address: string;
  signature: string;
  message: string;
  invite_code?: string;
  signup_mode?: string;
}

export function loginByWalletAPI(data: WalletReqDto): Promise<TokenDto | null> {
  data.invite_code = localStorage.getItem(KEY_INVITE_CODE) || undefined;
  return http.post('/api/auth/signin/wallet', JSON.stringify(data));
}

export function connectWalletAPI(data: WalletReqDto): Promise<TokenDto | null> {
  return http.post('/api/auth/connect/wallet', JSON.stringify(data));
}

export function loginByTelegramAPI(data: TelegramLoginData): Promise<boolean | null> {
  data.signup_mode = 'enabled';
  data.invite_code = localStorage.getItem(KEY_INVITE_CODE) || undefined;
  data.landing_url = `${location.origin}/Profile/edit`;
  return http.post('/api/auth/signin/telegram', JSON.stringify(data));
}

export function connectTelegramAPI(data: TelegramLoginData): Promise<boolean | null> {
  data.signup_mode = 'enabled';
  data.invite_code = localStorage.getItem(KEY_INVITE_CODE) || undefined;
  data.landing_url = `${location.origin}/Profile/edit`;
  return http.post('/api/auth/connect/telegram', JSON.stringify(data));
}

export function disconnectMediaAPI(type: string): Promise<null> {
  return http.post(`/api/auth/disconnect/${type}`);
}

export function confirmSignUpAPI(): Promise<TokenDto | null> {
  const signUpCred = localStorage.getItem(KEY_SIGN_UP_CRED);
  if (!signUpCred) return Promise.resolve(null);
  localStorage.removeItem(KEY_SIGN_UP_CRED);
  return http.post('/api/auth/signup', JSON.stringify({ signup_cred: signUpCred }));
}
