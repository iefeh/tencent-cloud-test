import http from '../index';

interface TokenMetadata {
  name: string;
  animation_url: string;
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
}

export interface MergeListItem extends NFTItem {
  request_token_metadata: (TokenMetadata | null)[];
}

export function queryMyNFTListAPI(params: PageQueryDto): Promise<PageResDTO<NFTItem>> {
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
