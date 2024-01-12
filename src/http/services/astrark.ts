import http from '../index';

export function preRegisterAPI(): Promise<boolean | null> {
  return http.post('/api/games/astrark/preregister');
}
