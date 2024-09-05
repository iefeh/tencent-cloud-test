import { type FC } from 'react';
import { CateTab } from '../model';
import useBScroll from '@/hooks/useBScroll';
import ShopItem from './ShopItem';
import ItemsCountdown from './ItemsCountdown';
import type { AstrArk } from '@/types/astrark';

const ItemCollections: FC<ItemProps<CateTab>> = ({ item }) => {
  const { scrollRef } = useBScroll({ scrollX: true, scrollY: false });

  function onItemClick(item: AstrArk.ShopItem) {
    // TODO 打开购买弹窗
  }

  return (
    <div className="flex-1 pt-9 w-[calc(100%_-_1rem)] relative">
      <div ref={scrollRef} className="w-full relative overflow-hidden">
        <div className="w-max flex">
          {item?.items instanceof Array
            ? item.items.map((shopItem) => <ShopItem key={shopItem.id} item={shopItem} onClick={onItemClick} />)
            : item?.items}
        </div>
      </div>

      <ItemsCountdown item={item} />
    </div>
  );
};

export default ItemCollections;
