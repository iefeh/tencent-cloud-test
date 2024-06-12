import http from '../index';

export interface OAuth2AuthorizationCodeDto {
    authorization_code: string;
    expires_at: Date;
    state: string;
}

export function oauthAuthorization(data: any): Promise<OAuth2AuthorizationCodeDto> {
    return http.post('/api/oauth2/authorize', JSON.stringify(data));
}