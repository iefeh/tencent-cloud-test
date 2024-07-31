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
