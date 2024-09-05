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
    <div className="flex mt-9 mr-4 relative">
      <div ref={scrollRef} className="w-full relative overflow-hidden">
        <div className="w-max flex">
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
    <div className="flex mt-9 ml-14 mr-12 relative">
      <div ref={scrollRef} className="w-full relative overflow-hidden">
        <div className="w-full flex flex-wrap gap-x-1 gap-y-2">
          {item?.items instanceof Array
            ? item.items.map((shopItem) => <ShopItem key={shopItem.id} item={shopItem} onClick={onClick} />)
            : item?.items}
        </div>
      </div>

      <ItemsCountdown item={item} />
    </div>
  );
};

const ResourcesDiamondItemCollection: ShopItemCollectionCom = ({ item, onClick }) => {
  const { scrollRef } = useBScroll({ scrollX: false, scrollY: true });

  return (
    <div className="flex mt-6 mx-[5.25rem] relative">
      <div ref={scrollRef} className="w-full relative overflow-hidden">
        <div className="w-full flex flex-wrap gap-x-2 gap-y-1">
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
  [ShopCateType.RESOURCES_DIAMOND_TOP_UP]: ResourcesDiamondItemCollection,
};

const ItemCollections: FC<ItemProps<CateTab>> = ({ item }) => {
  const CollectionCom = item?.type && ItemCollectionComs[item.type];

  function onItemClick(item: AstrArk.ShopItem) {
    // TODO 打开购买弹窗
  }

  return (
    <div className="flex-1 w-full relative">{CollectionCom && <CollectionCom item={item} onClick={onItemClick} />}</div>
  );
};

export default ItemCollections;
