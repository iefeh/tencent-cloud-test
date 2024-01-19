import http from '../index';

export function preRegisterAPI(): Promise<boolean | null> {
  return http.post('/api/games/astrark/preregister');
}

export interface PreRegisterInfoDTO {
  total: string | null;
  preregistered: boolean;
  hero_url: string;
}

export function queryPreRegisterInfoAPI(): Promise<PreRegisterInfoDTO> {
  return http.get('/api/games/astrark/preregistration');
}
