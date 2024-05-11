import { NFTCategory } from '@/constant/nft';
import http from '../index';

interface TokenMetadata {
  name: string;
  animation_url?: string;
  image?: string;
}

export interface NFTItem {
  chain_id: string;
  token_id: number;
  block_number: number;
  transaction_id: string;
  contract_address?: string;
  status?: string;
  transaction_status: string;
  token_metadata: TokenMetadata | null;
  confirmed_time?: number;
  sort?: number;
  wallet_addr?: string;
}

export interface MergeListItem extends NFTItem {
  request_token_metadata: (TokenMetadata | null)[];
}

export type MyNFTQueryParams = PageQueryDto & { category?: string };

export function queryMyNFTListAPI(
  params: MyNFTQueryParams,
): Promise<PageResDTO<NFTItem> & { wallet_connected: boolean }> {
  params.category = params.category || NFTCategory.TETRA_NFT;
  return http.get('/api/users/nft/list', { params });
}

export function queryNFTInfoAPI(params: { tx_id: string }): Promise<{ nft: NFTItem | null }> {
  return http.get('/api/users/nft/tx', { params });
}

export function queryLatestMergeReqAPI(params: { tx_id?: string }): Promise<{ merge: NFTItem | null }> {
  return http.get('/api/users/nft/merge_request/latest', { params });
}

export function queryMergeListAPI(params: PageQueryDto): Promise<PageResDTO<MergeListItem>> {
  return http.get('/api/users/nft/merge_request/list', { params });
}

export function queryDisplayNFTListAPI(): Promise<NFTItem[]> {
  return http.get('/api/users/nft/favourite');
}

export function updateDisplayNFTListAPI(data: Partial<NFTItem>[]): Promise<null> {
  return http.post('/api/users/nft/favourite', JSON.stringify(data));
}
