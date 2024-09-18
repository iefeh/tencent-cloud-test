import { ShopItemType } from '@/constant/astrark';

declare namespace AstrArk {
  interface ShopCate {
    name: string;
    order: number;
    product_types: ProductType[];
  }

  interface CateTab {
    label: string;
    key: string;
    type?: ShopCateType;
    isFree?: boolean;
    endTime?: number;
    children?: CateTab[];
    items?: Product[];
  }

  interface ProductType {
    limit_type: string;
    name: string;
    order: number;
    products: Product[];
    refresh_time: number;
  }

  interface Limit {
    amount: number;
    sold_amount: number;
  }

  interface Product {
    type?: ShopItemType;
    icon_url: string;
    id: string;
    limit: Limit;
    name: string;
    price_in_usdc: number;
    sold_out: boolean;
  }
}
