declare interface SendEmailCodeParamsDto {
  email: string;
  quick_fill_url?: string
}

declare interface LoginByEmailBodyDto {
  email: string;
  captcha: string;
}

declare interface TokenDto {
  token: string
}

declare interface GoogleAuthDto {
  authorization_url: string;
}

declare interface ParticleAuthDto {
  particle_auth_token: string;
  particle_user_id: string;
  platform?: string;
}
