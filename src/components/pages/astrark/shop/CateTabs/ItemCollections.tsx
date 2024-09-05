import { type FC } from 'react';
import { type CateTab, ShopCateType } from '../model';
import useBScroll from '@/hooks/useBScroll';
import ShopItem from './ShopItem';
import ItemsCountdown from './ItemsCountdown';
import type { AstrArk } from '@/types/astrark';

interface ClickProps {
  onClick?: (item: AstrArk.ShopItem) => void;
}

type ShopItemCollectionCom = FC<ItemProps<CateTab> & ClickProps>;

const BenefitsDailyItemCollection: ShopItemCollectionCom = ({ item, onClick }) => {
  const { scrollRef } = useBScroll({ scrollX: true, scrollY: false });

  return (
    <div ref={scrollRef} className="w-full relative overflow-hidden">
      <div className="w-max flex">
        {item?.items instanceof Array
          ? item.items.map((shopItem) => <ShopItem key={shopItem.id} item={shopItem} onClick={onClick} />)
          : item?.items}
      </div>
    </div>
  );
};

const BenefitsWeeklyItemCollection: ShopItemCollectionCom = ({ item, onClick }) => {
  const { scrollRef } = useBScroll({ scrollX: false, scrollY: true });

  return (
    <div ref={scrollRef} className="w-full relative overflow-hidden">
      <div className="w-full flex flex-wrap gap-x-1 gap-y-2">
        {item?.items instanceof Array
          ? item.items.map((shopItem) => <ShopItem key={shopItem.id} item={shopItem} onClick={onClick} />)
          : item?.items}
      </div>
    </div>
  );
};

const ItemCollectionComs: Dict<ShopItemCollectionCom> = {
  [ShopCateType.BENEFITS_DAILY]: BenefitsDailyItemCollection,
  [ShopCateType.BENEFITS_WEEKLY]: BenefitsWeeklyItemCollection,
};

const ItemCollections: FC<ItemProps<CateTab>> = ({ item }) => {
  const CollectionCom = item?.type && ItemCollectionComs[item.type];

  function onItemClick(item: AstrArk.ShopItem) {
    // TODO 打开购买弹窗
  }

  return (
    <div className="flex-1 pt-9 w-[calc(100%_-_1rem)] relative">
      {CollectionCom && <CollectionCom item={item} onClick={onItemClick} />}

      <ItemsCountdown item={item} />
    </div>
  );
};

export default ItemCollections;
