import { type FC } from 'react';
import { type CateTab, ShopCateType } from '../model';
import useBScroll from '@/hooks/useBScroll';
import ShopItem from './ShopItem';
import ItemsCountdown from './ItemsCountdown';
import type { AstrArk } from '@/types/astrark';
import S3Image from '@/components/common/medias/S3Image';

interface ClickProps {
  onClick?: (item: AstrArk.Product) => void;
}

type ShopItemCollectionCom = FC<ItemProps<CateTab> & ClickProps>;

const BenefitsDailyItemCollection: ShopItemCollectionCom = ({ item, onClick }) => {
  const { scrollRef } = useBScroll({ scrollX: true, scrollY: false });

  return (
    <div className="flex mt-9 mr-4 relative">
      <div ref={scrollRef} className="w-full relative overflow-hidden">
        <div className="w-max flex gap-6">
          {item?.items instanceof Array
            ? item.items.map((shopItem) => <ShopItem key={shopItem.id} item={shopItem} onClick={onClick} />)
            : item?.items}
        </div>
      </div>

      <ItemsCountdown item={item} />
    </div>
  );
};

const BenefitsWeeklyItemCollection: ShopItemCollectionCom = ({ item, onClick }) => {
  const { scrollRef } = useBScroll({ scrollX: false, scrollY: true });

  return (
    <div className="flex mt-9 ml-12 mr-10 h-full relative pb-16">
      <div ref={scrollRef} className="w-full h-full relative overflow-hidden">
        <div className="w-full flex flex-wrap gap-x-2 gap-y-2">
          {item?.items instanceof Array
            ? item.items.map((shopItem) => <ShopItem key={shopItem.id} item={shopItem} onClick={onClick} />)
            : item?.items}
        </div>
      </div>

      <ItemsCountdown item={item} />
    </div>
  );
};

const BenefitsMonthlyItemCollection: ShopItemCollectionCom = ({ item, onClick }) => {
  const shopItem = item?.items?.[0];
  const { icon_url, price_in_usdc } = shopItem || {};

  return (
    <div className="flex justify-center mt-9 relative text-[1.375rem]">
      {icon_url && (
        <div
          className="w-[46.5625rem] aspect-[745/406] cursor-pointer relative"
          onClick={() => shopItem && onClick?.(shopItem)}
        >
          <S3Image className="object-contain" src={icon_url} fill />

          <div className="absolute left-3 top-[18.75rem] text-[0.75rem] text-[#10538A] leading-6">
            Exclusive Deal, Unlock Extra Perks!
          </div>

          <div className="absolute left-[29.5rem] top-[22.5625rem] text-[#513218] leading-6">
            ${price_in_usdc || '--'} Buy Now
          </div>
        </div>
      )}
    </div>
  );
};

const ResourcesDiamondItemCollection: ShopItemCollectionCom = ({ item, onClick }) => {
  const { scrollRef } = useBScroll({ scrollX: false, scrollY: true });

  return (
    <div className="flex mt-6 mx-[5.25rem] h-full relative pb-16">
      <div ref={scrollRef} className="w-full h-full relative overflow-hidden">
        <div className="w-full flex flex-wrap gap-x-4 gap-y-4">
          {item?.items instanceof Array
            ? item.items.map((shopItem) => <ShopItem key={shopItem.id} item={shopItem} onClick={onClick} />)
            : item?.items}
        </div>
      </div>
    </div>
  );
};

const ItemCollectionComs: Dict<ShopItemCollectionCom> = {
  [ShopCateType.BENEFITS_DAILY]: BenefitsDailyItemCollection,
  [ShopCateType.BENEFITS_WEEKLY]: BenefitsWeeklyItemCollection,
  [ShopCateType.BENEFITS_MONTHLY]: BenefitsMonthlyItemCollection,
  [ShopCateType.RESOURCES_DIAMOND]: ResourcesDiamondItemCollection,
};

const ItemCollections: FC<ItemProps<CateTab> & { handleItemClick?: (item: AstrArk.Product) => void }> = ({
  item,
  handleItemClick,
}) => {
  const CollectionCom = item?.type && ItemCollectionComs[item.type];

  function onItemClick(item: AstrArk.Product) {
    if (item.sold_out) return;

    handleItemClick && handleItemClick(item);
  }

  return (
    <div className="flex-1 w-full relative overflow-hidden">
      {CollectionCom && <CollectionCom item={item} onClick={onItemClick} />}
    </div>
  );
};

export default ItemCollections;
