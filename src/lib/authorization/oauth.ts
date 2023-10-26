import {AuthenticateParams, AuthorizationParams, OAuthOptions, OAuthToken} from "@/lib/authorization/types";
import axios, {AxiosError} from "axios";

export class OAuthProvider {
    private readonly options: OAuthOptions;

    constructor(options: OAuthOptions) {
        this.options = options;
    }

    // authorizationURL 返回授权地址
    public authorizationURL(params: AuthorizationParams): string {
        const {clientId, redirectURI, authEndpoint, scope} = this.options;

        const defaultParams = {
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectURI,
            scope: Array.isArray(scope) ? scope.join(' ') : scope
        };

        const mergedParams = {
            ...defaultParams,
            ...params
        };

        const urlParams = new URLSearchParams(mergedParams);
        return `${authEndpoint}?${urlParams.toString()}`;
    }

    // oauth认证
    public async authenticate(params: AuthenticateParams): Promise<OAuthToken> {
        const {clientId, clientSecret, redirectURI, tokenEndpoint} = this.options;
        const defaultParams = {
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectURI,
        };
        const mergedParams = {
            ...defaultParams,
            ...params
        };
        // 固定加上basic auth，可以做成配置hook，让外部传递函数对请求的
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const headers = {
            Authorization: `Basic ${credentials}`,
        };
        const response = await axios.post<OAuthToken>(tokenEndpoint, mergedParams, {headers});
        const data = response.data;
        // console.log(data);
        return data as OAuthToken;
    }

    public async refreshAccessToken(token: OAuthToken): Promise<OAuthToken> {
        const {clientId, clientSecret, tokenEndpoint, onAccessTokenRefreshed, onRefreshTokenExpired} = this.options;
        try {
            const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const headers = {
                Authorization: `Basic ${credentials}`,
            };
            const response = await axios.post<OAuthToken>(tokenEndpoint, {
                grant_type: 'refresh_token',
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: token.refresh_token,
            }, {headers});
            console.log(response.status)
            const data = response.data;
            // 使用对象解构合并两个对象，确保只更新token相关数据，保留用户自定义数据
            const newToken = {
                ...token,
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
                scope: data.scope,
                token_type: data.token_type,
                id_token: data.id_token
            };
            if (onAccessTokenRefreshed) {
                onAccessTokenRefreshed(newToken);
            }
            return newToken as OAuthToken;
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401 && onRefreshTokenExpired) {
                onRefreshTokenExpired(token);
            }
            console.error(error);
            throw new Error("Failed to refresh access token: " + error);
        }
    }

    public createRequest(token: OAuthToken): OAuthRequest {
        return new OAuthRequest(this, token);
    }


}

function isAxiosError(error: any): error is AxiosError {
    return error && error.response;
}

// 用于以用户名义发起请求，自动刷新token
class OAuthRequest {
    private authProvider: OAuthProvider;
    private token: OAuthToken;

    constructor(authProvider: OAuthProvider, token: OAuthToken) {
        this.authProvider = authProvider;
        this.token = token;
    }

    public async get<T>(url: string, options?: any): Promise<T> {
        const {headers, retryOn401 = true} = options || {};
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
            if (isAxiosError(error) && error.response?.status === 403 && this.token.refresh_token && retryOn401) {
                this.token = await this.authProvider.refreshAccessToken(this.token);
                return this.get<T>(url, {...options, retryOn401: false});
            }
            throw error;
        }
    }

}