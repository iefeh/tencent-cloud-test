import http from '../index';

export function getWorldTimeAPI(): Promise<{ timestamp: number }> {
  return http.get('/api/common/time/current');
}
