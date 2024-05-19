import { Lottery } from '@/types/lottery';
import http from '../index';

export function queryPrizePoolListAPI(): Promise<{ lottery_pool_ids: string[] | null }> {
  return http.get('/api/lottery/list');
}

export function queryPrizePoolInfoAPI(params: { lottery_pool_id: string }): Promise<Lottery.Pool> {
  return http.get('/api/lottery/lotterypool', { params });
}

export function drawAPI(data: Lottery.DrawDTO): Promise<Lottery.RewardDTO & InfoDTO> {
  return http.post('/api/lottery/draw', JSON.stringify(data));
}

export function queryDrawHistoryAPI(params: { lottery_pool_id: string }): Promise<Lottery.RewardDTO[]> {
  return http.get('/api/lottery/history', { params });
}
