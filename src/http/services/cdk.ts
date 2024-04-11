import http from '../index';

export interface RedeemReward {
  type: string,
  image_url: string,
  amount: number,
  description: string
}

export interface RedeemDto {
  success: boolean;
  msg: string;
  reward: RedeemReward[]
}

export function exchangeRedeemCode(params: { cdk: string }): Promise<RedeemDto> {
  return http.get('/api/cdk/redeem', { params });
}
