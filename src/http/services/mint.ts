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
  transaction_status: string;
  token_metadata: TokenMetadata | null;
}

interface NFTListDTO {
  nfts: NFTItem[];
  page_num: number;
  page_size: number;
  total: number;
  wallet_connected: boolean;
}

export function queryMyNFTListAPI(params: PageQueryDto): Promise<NFTListDTO> {
  return http.get('/api/users/nft/list', { params });
}

export function queryNFTInfoAPI(params: { tx_id: string }) {
  return http.get('/api/users/nft/tx', { params });
}
