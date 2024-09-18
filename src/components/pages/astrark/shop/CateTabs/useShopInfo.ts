import { ProductLimitType, ShopItemType } from '@/constant/astrark';
import { queryShopInfoAPI } from '@/http/services/astrark';
import { useAAUserContext } from '@/store/AstrarkUser';
import { AstrArk } from '@/types/astrark';
import { useEffect, useState } from 'react';
import { ShopCateType } from '../model';

export default function useShopInfo() {
  const { token } = useAAUserContext();
  const [cates, setCates] = useState<AstrArk.CateTab[]>([]);
  const [loading, setLoading] = useState(false);

  async function queryShopInfo() {
    setLoading(true);

    const res = await queryShopInfoAPI();
    const list = res || [];
    setCates(list.map((item) => shopCateToCateTab(item)));

    setLoading(false);
  }

  function shopCateToCateTab(item: AstrArk.ShopCate): AstrArk.CateTab {
    return {
      label: item.name,
      key: item.name,
      children: (item.product_types || []).map((child) => productTypeToCateTab(child)),
    };
  }

  function productTypeToCateTab(item: AstrArk.ProductType): AstrArk.CateTab {
    const data: AstrArk.CateTab = {
      label: item.name,
      key: item.name,
      endTime: item.refresh_time,
      items: (item.products || []).map((product) => getProduct(item, product)),
    };

    switch (item.limit_type) {
      case ProductLimitType.Daily:
        data.type = ShopCateType.BENEFITS_DAILY;
        break;
      case ProductLimitType.Weekly:
        data.type = ShopCateType.BENEFITS_WEEKLY;
        break;
      case ProductLimitType.Monthly:
        data.type = ShopCateType.BENEFITS_MONTHLY;
        break;
    }

    return data;
  }

  function getProduct(type: AstrArk.ProductType, item: AstrArk.Product): AstrArk.Product {
    switch (type.limit_type) {
      case ProductLimitType.Daily:
        item.type = ShopItemType.BENEFITS_DAILY;
        break;
      case ProductLimitType.Weekly:
        item.type = ShopItemType.BENEFITS_WEEKLY;
        break;
      case ProductLimitType.Monthly:
        item.type = ShopItemType.BENEFITS_MONTHLY;
        break;
    }

    return item;
  }

  useEffect(() => {
    if (token) {
      queryShopInfo();
    } else {
      setCates([]);
    }
  }, [token]);

  return { loading, cates };
}
