import http from '../index';

export interface BadgeSerie {
  claimed_time: number | null;
  description: string;
  icon_url: string;
  image_url: string;
  lv: number;
  name: string;
  obtained_time: number | null;
}

export interface BadgeItem {
  badge_id: string;
  name: string;
  description?: string;
  icon_url?: string;
  image_url?: string;
  lv?: number;
  display?: boolean;
  order?: number;
  display_order?: number;
  has_series?: boolean;
  series?: BadgeSerie[];
  mintable?: boolean;
  minting?: boolean;
  minted?: boolean;
}

export function queryBadgesPageListAPI(
  params: PageQueryDto,
): Promise<PageResDTO<BadgeItem> & { claimed_count?: number }> {
  return http.get('/api/badges/list', { params });
}

export function queryDisplayBadgesAPI(): Promise<PageResDTO<BadgeItem> & { claimed_count?: number }> {
  return http.get('/api/badges/display');
}

export function claimBadgeAPI(data: { badge_id: string; badge_lv: number }): Promise<boolean> {
  return http.post('/api/badges/claim', JSON.stringify(data));
}

export function mintBadgeAPI(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
}

export function toggleBadgeDisplayAPI(id: string, display: boolean): Promise<boolean> {
  return http.post('/api/badges/badgeDisplay', JSON.stringify({ badge_id: id, display }));
}

export function sortDisplayBadgesAPI(
  data: { badge_id: string; display: boolean; display_order: number }[],
): Promise<boolean> {
  return http.post('/api/badges/saveDisplay', JSON.stringify(data));
}
