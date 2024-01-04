export interface OAuthOptions {
    clientId: string;
    clientSecret: string;
    scope: string | string[];
    redirectURI: string;
    authEndpoint: string;
    tokenEndpoint: string;

    enableBasicAuth?: boolean;
    basicAuthCredentialCallback?: (ops: OAuthOptions) => string;

    onAccessTokenRefreshed?: (newToken: AuthToken) => Promise<void>;
    onRefreshTokenExpired?: (newToken: AuthToken) => Promise<void>;
}

export interface AuthorizationParams {
    state: string;

    // 传递自定义的参数，例如传递code_challenge与code_challenge_method，我们不负责处理code challenge
    [key: string]: string | number | undefined;
}

export interface AuthenticateParams {
    code: string;

    [key: string]: string | number | undefined;

    headers?: any;
}

export interface AuthToken {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
    id_token?: string;
    // 访问token的过期时间，毫秒时间戳
    expire_time?: number;

    // 传递自定义参数，这些参数也将会出现在回调onAccessTokenRefreshed、onRefreshTokenExpired的入参中
    [key: string]: any;
}


export interface OAuthRefreshTokenPayload {
    grant_type: 'refresh_token';
    client_id: string;
    client_secret: string;
    refresh_token: string;

    [key: string]: any;
}

export enum AuthorizationType {
    Twitter = "twitter",
    Discord = "discord",
    Wallet = "wallet",
    Google = "google",
    Steam = "steam",
    Email = "email",
}

export enum CaptchaType {
    LoginCaptcha = "login_captcha",
    ConnectCaptcha = "connect_captcha",
}