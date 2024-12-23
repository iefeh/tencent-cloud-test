import { MediaType, QuestType } from '@/constant/task';
import http from '../index';
import { KEY_INVITE_CODE, KEY_SIGN_UP_CRED } from '@/constant/storage';
import { AuthorizationFlow } from '@/lib/models/authentication';
import { AppleAuthResponse } from 'react-apple-signin-auth';

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
  return http.get(`/api/auth/connect/${type}`, { params: getAuthParams(`/connect?type=${type}`) });
}

export function connectTelegramAuthAPI(): Promise<TelegramAuthDto> {
  return http.get('/api/auth/telegram/auth', { params: getAuthParams('/connect?type=telegram') });
}

export function loginTelegramAuthAPI(): Promise<TelegramAuthDto> {
  return http.get('/api/auth/telegram/auth', {
    params: {
      ...getAuthParams('?type=telegram'),
      invite_code: localStorage.getItem(KEY_INVITE_CODE) || undefined,
      signup_mode: 'enabled',
    },
  });
}

export function connectAppleAuthAPI(): Promise<AppleAuthDto> {
  return http.get('/api/auth/connect/apple', { params: getAuthParams('/connect?type=apple') });
}

export function loginAppleAuthAPI(): Promise<AppleAuthDto> {
  return http.get('/api/auth/signin/apple', {
    params: {
      ...getAuthParams('?type=apple'),
      invite_code: localStorage.getItem(KEY_INVITE_CODE) || undefined,
      signup_mode: 'enabled',
    },
  });
}

export function loginByMediaAPI(type: string): Promise<AuthDto> {
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

export interface TelegramLoginData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramAuthData {
  origin: string;
  html: string;
  user: TelegramLoginData;
}

export function loginByWalletAPI(data: WalletReqDto): Promise<TokenDto | null> {
  data.invite_code = localStorage.getItem(KEY_INVITE_CODE) || undefined;
  return http.post('/api/auth/signin/wallet', JSON.stringify(data));
}

export function connectWalletAPI(data: WalletReqDto): Promise<TokenDto | null> {
  return http.post('/api/auth/connect/wallet', JSON.stringify(data));
}

export function loginByTelegramAPI(data: TelegramLoginData): Promise<TokenDto | null> {
  return http.post('/api/auth/signin/telegram', JSON.stringify(data), {
    params: {
      ...getAuthParams(`?type=telegram`),
      invite_code: localStorage.getItem(KEY_INVITE_CODE) || undefined,
      signup_mode: 'enabled',
    },
  });
}

export function loginByAppleAPI(data: AppleAuthResponse): Promise<TokenDto | null> {
  const { origin } = location;
  return http.post(
    '/api/auth/signin/apple',
    JSON.stringify({
      state: data.authorization.state,
      code: data.authorization.code,
      id_token: data.authorization.id_token,
      user: data.user,
    }),
    {
      params: {
        landing_url: `${origin}/auth?type=apple`,
        invite_code: localStorage.getItem(KEY_INVITE_CODE) || undefined,
        signup_mode: 'enabled',
      },
    },
  );
}

export function connectTelegramAPI(data: TelegramLoginData | any): Promise<TokenDto | null> {
  return http.post('/api/auth/connect/telegram', JSON.stringify(data), {
    params: getAuthParams(`/connect?type=telegram`),
  });
}

export function connectAppleAPI(data: AppleAuthResponse): Promise<TokenDto | null> {
  const { origin } = location;
  return http.post(
    '/api/auth/connect/apple',
    JSON.stringify({
      state: data.authorization.state,
      code: data.authorization.code,
      id_token: data.authorization.id_token,
      user: data.user,
    }),
    {
      params: {
        landing_url: `${origin}/auth/connect?type=apple`,
      },
    },
  );
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

export function getTelegramAuthData(options: TelegramAuthDto): Promise<TelegramAuthData> {
  const emptyData = {} as TelegramAuthData;
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    var url = options.authorization_url + '/get';
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.responseText) {
          try {
            var result = JSON.parse(xhr.responseText);
          } catch (e) {
            resolve(emptyData);
          }

          resolve(result);
        } else {
          resolve(emptyData);
        }
      }
    };

    xhr.onerror = function () {
      reject(xhr.status);
    };

    xhr.withCredentials = true;
    xhr.send('bot_id=' + encodeURIComponent(options.bot_id));
  });
}
