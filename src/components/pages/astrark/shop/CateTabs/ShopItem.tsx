import S3Image from '@/components/common/medias/S3Image';
import { ShopItemType } from '@/constant/astrark';
import type { AstrArk } from '@/types/astrark';
import { FC } from 'react';

interface ClickProps {
  onClick?: (item: AstrArk.ShopItem) => void;
}

type ShopItemCom = FC<ItemProps<AstrArk.ShopItem> & ClickProps>;

const BenefitsDailyItem: ShopItemCom = ({ item, onClick }) => {
  const { icon_url, price_in_usdc, limit: { amount = '-', sold_amount = '-' } = {} } = item || {};

  return (
    <div
      className="relative h-[24.875rem] max-h-full aspect-[259/398] flex flex-col justify-between cursor-pointer"
      onClick={() => item && onClick?.(item)}
    >
      {icon_url && <S3Image className="object-cover" src={icon_url} fill />}

      <div className="flex-1 z-0"></div>

      <div className="h-[1.8125rem] flex-shrink-0 z-0 text-center">
        Purchase Limit {sold_amount}/{amount}
      </div>

      <div className="h-[3.25rem] flex-shrink-0 z-0 text-center text-xl leading-none pt-ten text-[#513218]">
        ${price_in_usdc || '-'}
      </div>
    </div>
  );
};

const BenefitsWeeklyItem: ShopItemCom = ({ item, onClick }) => {
  const { icon_url, price_in_usdc, limit: { amount = '-', sold_amount = '-' } = {} } = item || {};

  return (
    <div
      className="relative h-[12.75rem] max-h-full aspect-[226/204] flex flex-col justify-between cursor-pointer"
      onClick={() => item && onClick?.(item)}
    >
      {icon_url && <S3Image className="object-cover" src={icon_url} fill />}

      <div className="flex-1 z-0"></div>

      <div className="h-[1.625rem] flex-shrink-0 z-0 text-center">
        Purchase Limit {sold_amount}/{amount}
      </div>

      <div className="h-[2.875rem] flex-shrink-0 z-0 text-center text-xl leading-none pt-ten text-[#513218]">
        ${price_in_usdc || '-'}
      </div>
    </div>
  );
};

const ResourcesDiamondItem: ShopItemCom = ({ item, onClick }) => {
  const { icon_url, price_in_usdc, limit: { amount = '-', sold_amount = '-' } = {} } = item || {};

  return (
    <div
      className="relative h-[12.625rem] max-h-full aspect-[274/202] flex flex-col justify-between cursor-pointer"
      onClick={() => item && onClick?.(item)}
    >
      {icon_url && <S3Image className="object-cover" src={icon_url} fill />}

      <div className="flex-1 z-0"></div>

      <div className="h-[1.625rem] flex-shrink-0 z-0 text-center">
        Purchase Limit {sold_amount}/{amount}
      </div>

      <div className="h-[2.875rem] flex-shrink-0 z-0 text-center text-xl leading-none pt-ten text-[#513218]">
        ${price_in_usdc || '-'}
      </div>
    </div>
  );
};

const ItemComs: Dict<ShopItemCom> = {
  [ShopItemType.BENEFITS_DAILY]: BenefitsDailyItem,
  [ShopItemType.BENEFITS_WEEKLY]: BenefitsWeeklyItem,
  [ShopItemType.RESOURCES_DIAMOND]: ResourcesDiamondItem,
};

const ShopItem: FC<ItemProps<AstrArk.ShopItem> & ClickProps> = ({ item, onClick }) => {
  if (!item?.type) return null;

  const ItemCom = ItemComs[item.type as string];
  if (!ItemCom) return null;

  return <ItemCom item={item} onClick={onClick} />;
};

export default ShopItem;
