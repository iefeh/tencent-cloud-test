import http from '../index';

export function queryTokenPriceAPI(params: { token: string }): Promise<{ price: string }> {
  return http.get('/api/blockchain/token/price', { params, hideErrorTips: true });
}
