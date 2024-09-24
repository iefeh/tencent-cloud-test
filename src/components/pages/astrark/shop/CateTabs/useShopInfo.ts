import { ProductTypeName, ShopCateName, ShopItemType } from '@/constant/astrark';
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
      children: (item.product_types || []).map((child) => productTypeToCateTab(item, child)),
    };
  }

  function productTypeToCateTab(cate: AstrArk.ShopCate, item: AstrArk.ProductType): AstrArk.CateTab {
    const data: AstrArk.CateTab = {
      label: item.name,
      key: item.name,
      endTime: item.refresh_time,
      items: (item.products || []).map((product) => getProduct(cate, item, product)),
    };

    switch (cate.name) {
      case ShopCateName.BENEFITS:
        switch (item.name) {
          case ProductTypeName.BENEFITS_DAILY:
            data.type = ShopCateType.BENEFITS_DAILY;
            break;
          case ProductTypeName.BENEFITS_WEEKLY:
            data.type = ShopCateType.BENEFITS_WEEKLY;
            break;
          case ProductTypeName.BENEFITS_MONTHLY:
            data.type = ShopCateType.BENEFITS_MONTHLY;
            break;
        }
        break;
      case ShopCateName.STORE:
        break;
      case ShopCateName.RESOURCES:
        switch (item.name) {
          case ProductTypeName.RESOURCES_DIAMOND:
            data.type = ShopCateType.RESOURCES_DIAMOND;
            break;
        }
        break;
    }

    return data;
  }

  function getProduct(cate: AstrArk.ShopCate, type: AstrArk.ProductType, item: AstrArk.Product): AstrArk.Product {
    switch (cate.name) {
      case ShopCateName.BENEFITS:
        switch (type.name) {
          case ProductTypeName.BENEFITS_DAILY:
            item.type = ShopItemType.BENEFITS_DAILY;
            break;
          case ProductTypeName.BENEFITS_WEEKLY:
            item.type = ShopItemType.BENEFITS_WEEKLY;
            break;
          case ProductTypeName.BENEFITS_MONTHLY:
            item.type = ShopItemType.BENEFITS_MONTHLY;
            break;
        }
        break;
      case ShopCateName.STORE:
        break;
      case ShopCateName.RESOURCES:
        switch (type.name) {
          case ProductTypeName.RESOURCES_DIAMOND:
            item.type = ShopItemType.RESOURCES_DIAMOND;
            break;
        }
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
