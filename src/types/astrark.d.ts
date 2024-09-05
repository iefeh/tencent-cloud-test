import { ShopItemType } from '@/constant/astrark';

declare namespace AstrArk {
  type ShopItem = {
    id: string;
    type?: ShopItemType;
    icon_url: string;
    limit?: {
      amount: number;
      sold_amount?: number;
    };
    name: string;
    price_in_usdc: number;
    sold_out?: boolean;
    desc?: string;
  };
}
