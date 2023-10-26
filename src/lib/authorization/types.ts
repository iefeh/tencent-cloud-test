export interface OAuthOptions {
    clientId: string;
    clientSecret: string;
    scope: string | string[];
    redirectURI: string;
    authEndpoint: string;
    tokenEndpoint: string;
    onAccessTokenRefreshed?: (newToken: OAuthToken) => void;
    onRefreshTokenExpired?: (newToken: OAuthToken) => void;
}

export interface AuthorizationParams {
    state?: string;

    [key: string]: string | number | undefined;
}

export interface AuthenticateParams {
    code: string;

    [key: string]: string | number | undefined;
}

export interface OAuthToken {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
    id_token?: string;

    // 传递自定义参数，这些参数也将会出现在回调onAccessTokenRefreshed、onRefreshTokenExpired的入参中
    [key: string]: any;
}

