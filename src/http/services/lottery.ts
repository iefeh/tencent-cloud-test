import { Lottery } from '@/types/lottery';
import http from '../index';

export function queryPrizePoolListAPI(): Promise<{ lottery_pool_ids: string[] | null }> {
  return http.get('/api/lottery/list');
}

export function queryPoolsListAPI(params: PageQueryDto & { status?: string }): Promise<PageResDTO<Lottery.Pool>> {
  return http.get('/api/lottery/list', { params });
}

export function queryPrizePoolInfoAPI(params: { lottery_pool_id: string }): Promise<Lottery.Pool> {
  return http.get('/api/lottery/lotterypool', { params });
}

export function drawAPI(data: Partial<Lottery.DrawDTO>): Promise<Lottery.RewardResDTO & InfoDTO> {
  return http.post('/api/lottery/draw', JSON.stringify(data));
}

export function queryDrawHistoryAPI(
  params: {
    lottery_pool_id: string;
  } & PageQueryDto,
): Promise<PageResDTO<Lottery.DrawHistoryDTO>> {
  return http.get('/api/lottery/history', { params });
}

export function claimRewardAPI(data: Lottery.ClaimReqDTO): Promise<InfoDTO & { require_authorization?: string }> {
  return http.post('/api/lottery/claim', JSON.stringify(data));
}

export function queryDrawMilestoneAPI(): Promise<Lottery.MilestoneDTO> {
  return http.get('/api/lottery/milestone');
}

export function getTwitterURLAPI(params: { lottery_pool_id: string; draw_id: string }): Promise<{ postUrl: string }> {
  return http.get('/api/lottery/twitter', { params });
}

export function claimPremiumTicketsAPI(data: { lottery_pool_id: string }): Promise<null> {
  return http.post('/api/lottery/premium/claim_benifits', JSON.stringify(data));
}
