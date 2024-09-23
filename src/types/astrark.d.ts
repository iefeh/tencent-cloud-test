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
    max_discount?: number;
  }

  interface PriceToken {
    product_id?: string;
    token_id: string; 
    token_name: string; 
    icon_url: string; 
    symbol: string; 
    product_price_discount: number; 
    product_token_price_with_discount: number; 
    product_usdc_price_with_discount: number;
    network: {
      name: string;
      icon_url: string;
      chain_id: string;
    }
  }

  interface ProductItem {
    id: string;
    name: string;
    icon_url: string;
    price_in_usdc: number;
    limit: {
     type: string;
     amount: number;
    };
    price_in_tokens: PriceToken[];
    product_type_id: string;
    price_updated_at: number;
  }

  interface PermitProps {
    product_id: string;
    token_id: string;
  }

  interface PermitRespose {
    chain_id: string;
    contract_address: string;
    permit: {
      reqId: string;
      expiration: number;
      productId: string;
      signature: string;
      token: string;
      tokenAmount: string;
    }
  }
}
