import http from '../index';

export function queryMiniGamesAPI(
  params: PageQueryDto & { status?: string; ticket_available?: number },
): Promise<PageResDTO<MiniGames.GameItem>> {
  return http.get('/api/minigame/list', { params });
}
