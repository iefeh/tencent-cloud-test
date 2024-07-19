import { NFTCategory } from '@/constant/nft';
import http from '../index';
import type { MyNFTQueryParams, NFTItem } from './mint';

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

export function queryMyNFTListAPI(
  params: MyNFTQueryParams,
): Promise<PageResDTO<NFTItem> & { wallet_connected: boolean }> {
  params.category = params.category || NFTCategory.TETRA_NFT;
  return http.get('/api/oauth2/nft/list', { params });
}

export function queryDisplayNFTListAPI(): Promise<NFTItem[]> {
  return http.get('/api/oauth2/nft/favourite');
}

export function updateDisplayNFTListAPI(data: Partial<NFTItem>[]): Promise<null> {
  return http.post('/api/oauth2/nft/favourite', JSON.stringify(data));
}

export interface AccountStatusDTO {
  destruct_request_submitted: boolean;
  selfdestruct_request_time: number | null;
  selfdestruct_finish_time: number | null;
}

export interface ResultDTO {
  result: boolean;
  message?: string;
}

export function checkDeleteStatusAPI(): Promise<AccountStatusDTO> {
  return http.get('/api/oauth2/selfdestruct/check');
}

export function deleteAccountAPI(): Promise<ResultDTO> {
  return http.post('/api/oauth2/selfdestruct/request');
}

export function cancelDeleteAccountAPI(): Promise<ResultDTO> {
  return http.post('/api/oauth2/selfdestruct/cancel');
}
