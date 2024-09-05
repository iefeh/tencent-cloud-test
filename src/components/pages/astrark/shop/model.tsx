import { ShopCate, ShopItemType } from '@/constant/astrark';
import type { AstrArk } from '@/types/astrark';
import dayjs from 'dayjs';

export const enum ShopCateType {
  BENEFITS_DAILY = 'benefits_daily',
  BENEFITS_WEEKLY = 'benefits_weekly',
  BENEFITS_MONTHLY = 'benefits_monthly',
}

export interface CateTab {
  label: string;
  key: string;
  type?: ShopCateType;
  isFree?: boolean;
  endTime?: number;
  children?: CateTab[];
  items?: AstrArk.ShopItem[] | JSX.Element;
}

export const cateTabs: CateTab[] = [
  {
    label: 'Benefits',
    key: ShopCate.BENEFITS,
    children: [
      {
        key: 'daily_gift_pack',
        label: 'Daily Gift Pack',
        type: ShopCateType.BENEFITS_DAILY,
        endTime: dayjs().add(3, 'h').valueOf(),
        items: Array(10)
          .fill(null)
          .map((_, i) => {
            return {
              id: i + '',
              type: ShopItemType.BENEFITS_DAILY,
              icon_url: '/astrark/shop/bg_item_daily.png',
              limit: {
                amount: 99,
              },
              name: 'xxx',
              price_in_usdc: 99,
              sold_out: false,
            };
          }),
      },
      {
        key: 'weekly_gift_pack',
        label: 'Weekly Gift Pack',
        type: ShopCateType.BENEFITS_WEEKLY,
        items: Array(10)
          .fill(null)
          .map((_, i) => {
            return {
              id: i + '',
              type: ShopItemType.BENEFITS_WEEKLY,
              icon_url: '/astrark/shop/bg_item_weekly.png',
              limit: {
                amount: 99,
              },
              name: 'xxx',
              price_in_usdc: 99,
              sold_out: false,
            };
          }),
      },
      {
        key: 'monthly_card',
        label: 'Monthly Card',
      },
    ],
  },
  {
    label: 'Store',
    key: ShopCate.STORE,
  },
  {
    label: 'Resources',
    key: ShopCate.RESOURCES,
  },
];
