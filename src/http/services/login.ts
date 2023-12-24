import http from '../index';

function getAuthParams() {
  const { origin } = location;
  const params = {
    landing_url: `${origin}/auth`,
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

export function connectTwitterAPI(): Promise<AuthDto> {
  return http.get('/api/auth/connect/twitter', { params: getAuthParams() });
}

export function connectSteamAPI(): Promise<AuthDto> {
  return http.get('/api/auth/connect/steam', { params: getAuthParams() });
}

export function connectDiscordAPI(): Promise<AuthDto> {
  return http.get('/api/auth/connect/discord', { params: getAuthParams() });
}
