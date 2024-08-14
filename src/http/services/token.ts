import http from '../index';
import type { TokenRewardStatus } from '@/constant/token';

export interface MyTokensRecord {
  source_type: string;
  reward_id: string;
  token_amount_raw: string;
  token_amount_formatted: string;
  status: TokenRewardStatus;
  created_time: number | null;
  claimed_time: number | null;
  tx_hash?: string;
  token: {
    chain_id: string;
    address: string;
    network: string;
    symbol: string;
    icon: string;
    name: string;
  };
}

export function queryMyTokensListAPI(
  params: PageQueryDto & { source_type?: string },
): Promise<PageResDTO<MyTokensRecord> & { source_types: string[] }> {
  return http.get('/api/users/token_list', { params });
}

export function queryTokenPermitAPI(params: { reward_ids?: string }): Promise<TokenReward.PermitDTO> {
  return http.get('/api/users/reward/permit', { params });
}

export function postTokenTxAPI(data: { tx_hash: string; chain_id: string }): Promise<null> {
  return http.post('/api/users/reward/report', JSON.stringify(data));
}
