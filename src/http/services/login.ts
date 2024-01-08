import { MediaType, QuestType } from '@/constant/task';
import http from '../index';

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

export function connectGoogleAPI(): Promise<AuthDto> {
  return http.get('/api/auth/connect/google', { params: getAuthParams(`/connect?type=${MediaType.GOOGLE}`) });
}

export function connectTwitterAPI(): Promise<AuthDto> {
  return http.get('/api/auth/connect/twitter', { params: getAuthParams(`/connect?type=${QuestType.ConnectTwitter}`) });
}

export function connectSteamAPI(): Promise<AuthDto> {
  return http.get('/api/auth/connect/steam', { params: getAuthParams(`/connect?type=${QuestType.ConnectSteam}`) });
}

export function connectDiscordAPI(): Promise<AuthDto> {
  return http.get('/api/auth/connect/discord', { params: getAuthParams(`/connect?type=${QuestType.ConnectDiscord}`) });
}

export function connectMediaAPI(type: string): Promise<AuthDto> {
  return http.get(`/api/auth/connect/${type}`, { params: getAuthParams(`/connect?type=${type}`) });
}

export function loginByMediaAPI(type: string): Promise<AuthDto> {
  return http.get(`/api/auth/signin/${type}`, { params: getAuthParams(`?type=${type}`) });
}

export function loginByWalletAPI(data: {
  address: string;
  signature: string;
  message: string;
}): Promise<boolean | null> {
  return http.post('/api/auth/signin/wallet', JSON.stringify(data));
}

export function connectWalletAPI(data: {
  address: string;
  signature: string;
  message: string;
}): Promise<boolean | null> {
  return http.post('/api/auth/connect/wallet', JSON.stringify(data));
}

export function disconnectWalletAPI(): Promise<boolean | null> {
  return http.post('/api/auth/disconnect/wallet');
}

export function disconnectTwitterAPI(): Promise<boolean | null> {
  return http.post('/api/auth/disconnect/twitter');
}

export function disconnectSteamAPI(): Promise<boolean | null> {
  return http.post('/api/auth/disconnect/steam');
}

export function disconnectGoogleAPI(): Promise<boolean | null> {
  return http.post('/api/auth/disconnect/google');
}

export function disconnectDiscordAPI(): Promise<boolean | null> {
  return http.post('/api/auth/disconnect/discord');
}

export function disconnectEmailAPI(): Promise<boolean | null> {
  return http.post('/api/auth/disconnect/email');
}
