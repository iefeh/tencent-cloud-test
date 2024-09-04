import { ShopCate } from '@/constant/astrark';

export interface CateTab {
  label: string;
  key: string;
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
      },
      {
        key: 'weekly_gift_pack',
        label: 'Weekly Gift Pack',
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
