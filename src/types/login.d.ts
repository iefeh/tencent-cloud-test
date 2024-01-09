declare interface SendEmailCodeParamsDto {
  email: string;
  quick_fill_url?: string;
}

declare interface LoginByEmailBodyDto {
  email: string;
  captcha: string;
  invite_code?: string;
}

declare interface TokenDto {
  is_new_user: boolean;
  token: string;
  particle_jwt: string;
}

declare interface AuthDto {
  authorization_url: string;
}

declare interface ParticleAuthDto {
  particle_auth_token: string;
  particle_user_id: string;
  platform?: string;
}
