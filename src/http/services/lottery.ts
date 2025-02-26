import { Lottery } from '@/types/lottery';
import http from '../index';

export interface LotteryBadgeRequirementPropertyDTO {
  badge_id: string;
  name: string;
  icon_url: string;
  image_url: string;
  description: string;
  lvl: string;
}

export interface LotteryNFTRequirementPropertyDTO {
  contract_addr: string;
  name: string;
}

export interface LotteryMBRequirementPropertyDTO {
  mb_amount: number;
}

export interface LotteryWhitelistRequirementPropertyDTO {
  image_url: string;
}

export interface LotteryBadgeRequirementDTO {
  type: 'badge';
  properties: LotteryBadgeRequirementPropertyDTO[];
  description?: string;
}

export interface LotteryNFTRequirementDTO {
  type: 'nft';
  properties: LotteryNFTRequirementPropertyDTO[];
  description?: string;
}

export interface LotteryMBRequirementDTO {
  type: 'moon_beam';
  properties: LotteryMBRequirementPropertyDTO[];
  description?: string;
}

export interface LotteryWhitelistRequirementDTO {
  type: 'whitelist';
  properties: LotteryWhitelistRequirementPropertyDTO[];
  description?: string;
}

export type LotteryRequirementDTO =
  | LotteryBadgeRequirementDTO
  | LotteryNFTRequirementDTO
  | LotteryMBRequirementDTO
  | LotteryWhitelistRequirementDTO;

export function queryPrizePoolListAPI(): Promise<{ lottery_pool_ids: string[] | null }> {
  return http.get('/api/lottery/list');
}

export function queryPoolsListAPI(params: PageQueryDto & { open_status?: string }): Promise<PageResDTO<Lottery.Pool>> {
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

export function queryHasNewPoolAPI(): Promise<{ new_eligible_pool_exists: boolean }> {
  return http.get('/api/users/new_eligible_lotterypool');
}

export type DrawPermit = any;

export interface DrawPermitResDTO {
  chain_id: string;
  contract_address: `0x${string}`;
  permit: DrawPermit;
}

export function queryDrawPermitAPI(data: Partial<Lottery.DrawDTO>): Promise<DrawPermitResDTO> {
  return http.post('/api/lottery/draw/permit', JSON.stringify(data));
}

export function drawReportAPI(data: { tx_hash: string; chain_id: string }): Promise<Lottery.RewardResDTO> {
  return http.post('/api/lottery/draw/report', JSON.stringify(data));
}
