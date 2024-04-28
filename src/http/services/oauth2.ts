import http from '../index';

export interface OAuth2Options {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  state: string;
  scope: string;
}

export interface OAuth2AuthorizationCodeDto {
  authorization_code: string;
  expires_at: Date;
  state: string;
}

export function oauthAuthorization(data: OAuth2Options): Promise<OAuth2AuthorizationCodeDto> {
  return http.post('/api/oauth2/authorize', JSON.stringify(data));
}