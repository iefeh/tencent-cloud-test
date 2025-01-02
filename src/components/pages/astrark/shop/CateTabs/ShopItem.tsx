import S3Image from '@/components/common/medias/S3Image';
import { MAX_LIMIT_AMOUNT, ShopItemType } from '@/constant/astrark';
import type { AstrArk } from '@/types/astrark';
import { Button } from '@nextui-org/react';
import { FC } from 'react';

export interface ClickProps {
  onClick?: (item: AstrArk.Product) => void;
}

type ShopItemCom = FC<ItemProps<AstrArk.Product> & ClickProps>;

const BenefitsDailyItem: ShopItemCom = ({ item, onClick }) => {
  const {
    icon_url,
    price_in_usdc,
    limit: { amount = '-', sold_amount = '-' } = {},
    sold_out,
    max_discount,
  } = item || {};

  return (
    <Button
      className="relative h-[24.875rem] max-h-full aspect-[259/398] flex flex-col justify-between cursor-pointer bg-transparent rounded-none shadow-none"
      disableRipple
      onPress={() => item && onClick?.(item)}
    >
      {icon_url && <S3Image className="object-cover" src={icon_url} fill />}

      <div className="flex-1 z-0"></div>

      <div className="h-[1.125rem] flex-shrink-0 z-0 text-center">
        Purchase Limit {sold_amount}/{+amount > MAX_LIMIT_AMOUNT ? '∞' : amount}
      </div>

      <div className="h-[2.75rem] flex-shrink-0 z-0 text-center text-xl leading-none pt-ten text-[#513218]">
        ${price_in_usdc || '-'}
      </div>

      {max_discount && (
        <div className="absolute top-[1.125rem] left-3 z-0 text-base leading-4">{(max_discount * 100).toFixed(1)}</div>
      )}

      {sold_out && (
        <div className="absolute inset-0 z-1 bg-black/50">
          <S3Image
            className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[47.5%] aspect-[114/99] max-w-[7.125rem]"
            src="/astrark/shop/sold_out.png"
            alt=""
          />
        </div>
      )}
    </Button>
  );
};

const BenefitsWeeklyItem: ShopItemCom = ({ item, onClick }) => {
  const { icon_url, price_in_usdc, limit: { amount = '-', sold_amount = '-' } = {}, sold_out } = item || {};

  return (
    <Button
      className="relative h-[12.75rem] max-h-full aspect-[226/204] flex flex-col justify-between cursor-pointer bg-transparent rounded-none shadow-none"
      onPress={() => item && onClick?.(item)}
    >
      {icon_url && <S3Image className="object-cover" src={icon_url} fill />}

      <div className="flex-1 z-0"></div>

      <div className="h-3 flex-shrink-0 z-0 text-center">
        Purchase Limit {sold_amount}/{+amount > MAX_LIMIT_AMOUNT ? '∞' : amount}
      </div>

      <div className="h-[2.5625rem] flex-shrink-0 z-0 text-center text-xl leading-none pt-ten text-[#513218]">
        ${price_in_usdc || '-'}
      </div>

      {sold_out && (
        <div className="absolute inset-0 z-0 bg-black/50">
          <S3Image
            className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[47.5%] aspect-[114/99] max-w-[7.125rem]"
            src="/astrark/shop/sold_out.png"
            alt=""
          />
        </div>
      )}
    </Button>
  );
};

const BenefitsBattlePassItem: ShopItemCom = ({ item, onClick }) => {
  const { icon_url, price_in_usdc, limit: { amount = '-', sold_amount = '-' } = {}, sold_out } = item || {};

  return (
    <Button
      className="relative h-[12.75rem] max-h-full aspect-[226/204] flex flex-col justify-between cursor-pointer bg-transparent rounded-none shadow-none"
      onPress={() => item && onClick?.(item)}
    >
      {icon_url && <S3Image className="object-cover" src={icon_url} fill />}

      <div className="flex-1 z-0"></div>

      <div className="h-3 flex-shrink-0 z-0 text-center">
        Purchase Limit {sold_amount}/{+amount > MAX_LIMIT_AMOUNT ? '∞' : amount}
      </div>

      <div className="h-[2.5625rem] flex-shrink-0 z-0 text-center text-xl leading-none pt-ten text-[#513218]">
        ${price_in_usdc || '-'}
      </div>

      {sold_out && (
        <div className="absolute inset-0 z-0 bg-black/50">
          <S3Image
            className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[47.5%] aspect-[114/99] max-w-[7.125rem]"
            src="/astrark/shop/sold_out.png"
            alt=""
          />
        </div>
      )}
    </Button>
  );
};

const ResourcesDiamondItem: ShopItemCom = ({ item, onClick }) => {
  const { icon_url, price_in_usdc, limit: { amount = '-', sold_amount = '-' } = {}, sold_out } = item || {};

  return (
    <Button
      className="relative h-[12.625rem] max-h-full aspect-[274/202] flex flex-col justify-between cursor-pointer bg-transparent rounded-none shadow-none"
      onPress={() => item && onClick?.(item)}
    >
      {icon_url && <S3Image className="object-contain" src={icon_url} fill />}

      <div className="flex-1 z-0"></div>

      <div className="h-[2.5625rem] flex-shrink-0 z-0 text-center text-xl leading-none pt-ten text-[#513218]">
        ${price_in_usdc || '-'}
      </div>

      {sold_out && (
        <div className="absolute inset-0 z-0 bg-black/50">
          <S3Image
            className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[47.5%] aspect-[114/99] max-w-[7.125rem]"
            src="/astrark/shop/sold_out.png"
            alt=""
          />
        </div>
      )}
    </Button>
  );
};

const ItemComs: Dict<ShopItemCom> = {
  [ShopItemType.BENEFITS_DAILY]: BenefitsDailyItem,
  [ShopItemType.BENEFITS_WEEKLY]: BenefitsWeeklyItem,
  [ShopItemType.BENEFITS_BATTLE_PASS]: BenefitsBattlePassItem,
  [ShopItemType.RESOURCES_DIAMOND]: ResourcesDiamondItem,
};

const ShopItem: FC<ItemProps<AstrArk.Product> & ClickProps> = ({ item, onClick }) => {
  if (!item?.type) return null;

  const ItemCom = ItemComs[item.type as string];
  if (!ItemCom) return null;

  return <ItemCom item={item} onClick={onClick} />;
};

export default ShopItem;
