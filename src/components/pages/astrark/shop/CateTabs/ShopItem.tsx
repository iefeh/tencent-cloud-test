import S3Image from '@/components/common/medias/S3Image';
import { ShopItemType } from '@/constant/astrark';
import type { AstrArk } from '@/types/astrark';
import { FC } from 'react';

const BenefitsDailyItem: FC<ItemProps<AstrArk.ShopItem>> = ({ item }) => {
  const { icon_url, price_in_usdc, limit: { amount = '-', sold_amount = '-' } = {} } = item || {};

  return (
    <div className="relative h-[24.875rem] max-h-full aspect-[259/398] flex flex-col justify-between cursor-pointer">
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

const ShopItem: FC<ItemProps<AstrArk.ShopItem>> = ({ item }) => {
  if (!item) return null;

  switch (item.type) {
    case ShopItemType.BENEFITS_DAILY:
      return <BenefitsDailyItem item={item} />;
    default:
      return null;
  }
};

export default ShopItem;
