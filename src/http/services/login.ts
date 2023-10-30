import http from '../index';

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

export function getGoogleAuthLinkAPI(): Promise<GoogleAuthDto> {
  const { origin } = location;
  const params = {
    landing_url: `${origin}/auth`,
  };

  return http.get('/api/auth/signin/google', { params });
}

export function getTwitterAuthLinkAPI(): Promise<GoogleAuthDto> {
  const { origin } = location;
  const params = {
    landing_url: `${origin}/auth`,
  };

  return http.get('/api/auth/signin/twitter', { params });
}
