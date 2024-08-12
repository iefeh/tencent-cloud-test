import type { MiniGames } from '@/types/minigames';
import http from '../index';

export function queryMiniGamesAPI(
  params: PageQueryDto & { status?: string; ticket_available?: number },
): Promise<PageResDTO<MiniGames.GameItem>> {
  return http.get('/api/minigame/list', { params });
}

export function queryMiniGameDetailsAPI(params: { client_id: string }): Promise<MiniGames.GameDetailDTO> {
  return http.get('/api/minigame/detail', { params });
}

export function queryGameTicketsAPI(params: { game_id: string }): Promise<{ available_tickets: number }> {
  return http.get('/api/minigame/ticket/mine', { params });
}

export function getBuyTicketsPermitAPI(params: {
  game_id: string;
  amount: number;
}): Promise<MiniGames.BuyTicketPermitDTO> {
  return http.get('/api/minigame/ticket/permit', { params });
}

export function buyTicketsCallbackAPI(data: {
  game_id: string;
  txHash: string;
}): Promise<{ available_tickets: number }> {
  return http.post('/api/minigame/ticket/permit', JSON.stringify(data));
}
