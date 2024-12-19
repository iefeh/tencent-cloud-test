import { AuthenticateParams, AuthorizationParams, OAuthOptions, AuthToken } from '@/lib/authorization/types';
import axios, { AxiosError } from 'axios';
import logger from '@/lib/logger/winstonLogger';
import { inspect } from 'util';

export class OAuthProvider {
  public options: OAuthOptions;

  constructor(options: OAuthOptions) {
    this.options = options;
  }

  public authorizationURL(extraParams: AuthorizationParams): string {
    const { clientId, redirectURI, authEndpoint, scope } = this.options;

    const baseParams = {
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectURI,
      scope: Array.isArray(scope) ? scope.join(' ') : scope,
    };

    const params = {
      ...baseParams,
      ...extraParams,
    };

    const urlParams = new URLSearchParams(params);
    return `${authEndpoint}?${urlParams.toString()}`;
  }

  public async authenticate(extraParams: AuthenticateParams): Promise<AuthToken> {
    const { clientId, clientSecret, redirectURI, tokenEndpoint } = this.options;
    const baseParams = {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectURI,
    };
    const merged = {
      ...baseParams,
      ...extraParams,
    };
    // 把参数转为form-urlencoded
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      params.append(key, value as string);
    }
    // 设置请求头
    let headers = this.calcBasicAuthHeader();
    headers = {
      ...headers,
      'Content-type': 'application/x-www-form-urlencoded',
    };
    const response = await axios.post<AuthToken>(tokenEndpoint, params, { headers });
    const data = response.data;
    return data as AuthToken;
  }

  public calcBasicAuthHeader(): {} {
    const { clientId, clientSecret, enableBasicAuth, basicAuthCredentialCallback } = this.options;
    if (!enableBasicAuth) {
      return {};
    }

    let credential: string;
    if (basicAuthCredentialCallback) {
      credential = basicAuthCredentialCallback(this.options);
    } else {
      credential = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    }
    return { Authorization: `Basic ${credential}` };
  }

  public async refreshAccessToken(token: AuthToken): Promise<AuthToken> {
    logger.debug(`refresh platform ${token.platform} user ${token.platform_id} auth token.`);
    const { onAccessTokenRefreshed, onRefreshTokenExpired } = this.options;
    try {
      const params = new URLSearchParams();
      params.set('grant_type', 'refresh_token');
      params.set('client_id', this.options.clientId);
      params.set('client_secret', this.options.clientSecret);
      params.set('refresh_token', token.refresh_token!);
      // 设置请求头
      let headers = this.calcBasicAuthHeader();
      headers = {
        ...headers,
        'Content-type': 'application/x-www-form-urlencoded',
      };
      const response = await axios.post<AuthToken>(this.options.tokenEndpoint, params, { headers });
      const data = response.data;
      // 使用对象解构合并两个对象，确保只更新token相关数据，保留用户自定义数据
      const newToken = {
        ...token,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        scope: data.scope,
        token_type: data.token_type,
        id_token: data.id_token,
      };
      if (onAccessTokenRefreshed) {
        await onAccessTokenRefreshed(newToken);
      }
      return newToken as AuthToken;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401 && onRefreshTokenExpired) {
        await onRefreshTokenExpired(token);
      }
      throw error;
    }
  }

  public createRequest(token: AuthToken): OAuthRequest {
    return new OAuthRequest(this, token);
  }
}

function isAxiosError(error: any): error is AxiosError {
  return error && error.response;
}

class OAuthRequest {
  private authProvider: OAuthProvider;
  public token: AuthToken;
  // 请求重试的状态码标识，默认401
  private retryHttpStatus: number;

  constructor(authProvider: OAuthProvider, token: AuthToken) {
    this.authProvider = authProvider;
    this.token = token;
    this.retryHttpStatus = 401;
  }

  public setRetryHttpStatus(status: number): OAuthRequest {
    this.retryHttpStatus = status;
    return this;
  }

  private async checkRefreshTokenExpiration() {
    if (!this.token.expire_time) {
      return;
    }
    // 给与10秒的缓冲时间
    const now = Date.now() + 10 * 1000;
    if (now < this.token.expire_time) {
      return;
    }
    // token已过期，执行刷新.
    this.token = await this.authProvider.refreshAccessToken(this.token);
  }

  public async get<T>(url: string, options?: any): Promise<T> {
    await this.checkRefreshTokenExpiration();
    logger.debug(`making http get request to ${url}.`);
    const { headers, retry } = options || {};
    try {
      const response = await axios.get<T>(url, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${this.token.access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (
        isAxiosError(error) &&
        error.response?.status === this.retryHttpStatus &&
        this.token.refresh_token &&
        !retry
      ) {
        logger.debug(`retrying request ${url} on status ${this.retryHttpStatus}`);
        this.token = await this.authProvider.refreshAccessToken(this.token);
        return this.get<T>(url, { ...options, retry: 1 });
      }
      throw error;
    }
  }

  public async post<T>(url: string, data?: any, options?: any): Promise<T> {
    await this.checkRefreshTokenExpiration();
    logger.debug(`making http post request to ${url}.`);
    const { headers, retry } = options || {};
    try {
      const response = await axios.post<T>(url, data, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${this.token.access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (
        isAxiosError(error) &&
        error.response?.status === this.retryHttpStatus &&
        this.token.refresh_token &&
        !retry
      ) {
        logger.debug(`retrying request ${url} on status ${this.retryHttpStatus}`);
        this.token = await this.authProvider.refreshAccessToken(this.token);
        return this.post<T>(url, data, { ...options, retry: 1 });
      }
      throw error;
    }
  }
}

