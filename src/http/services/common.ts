import http from '../index';

export function getWorldTimeAPI(): Promise<WorldTime> {
  return http.get('https://worldtimeapi.org/api/ip');
}
