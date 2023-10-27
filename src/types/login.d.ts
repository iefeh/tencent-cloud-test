declare interface SendEmailCodeParamsDto {
  email: string;
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
