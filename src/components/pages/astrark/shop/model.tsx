import type { AstrArk } from '@/types/astrark';

export const enum ShopCateType {
  BENEFITS_DAILY = 'benefits_daily',
  BENEFITS_WEEKLY = 'benefits_weekly',
  BENEFITS_MONTHLY = 'benefits_monthly',
  RESOURCES_DIAMOND = 'resources_diamond_top_up',
}

export interface CateTab {
  label: string;
  key: string;
  type?: ShopCateType;
  isFree?: boolean;
  endTime?: number;
  children?: CateTab[];
  items?: AstrArk.Product[];
}
