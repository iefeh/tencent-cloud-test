import { MAX_DISPLAY_COUNT } from '@/constant/badge';
import { BadgeItem, queryDisplayBadgesAPI, sortDisplayBadgesAPI } from '@/http/services/badges';
import { MobxContext } from '@/pages/_app';
import { throttle } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';

export default function useDisplayBadges() {
  const { userInfo } = useContext(MobxContext);
  const [badges, setBadges] = useState<Array<BadgeItem | null>>(Array(MAX_DISPLAY_COUNT).fill(''));
  const badgesRef = useRef<Array<BadgeItem | null>>(badges);
  const [loading, setLoading] = useState(false);
  const [validCount, setValidCount] = useState(0);
  const [total, setTotal] = useState(0);

  const queryDisplayBadges = throttle(async () => {
    setLoading(true);
    const res = await queryDisplayBadgesAPI();
    const list = res?.result || [];
    setValidCount(list.length);
    setTotal(res?.claimed_count || 0);

    if (list.length < MAX_DISPLAY_COUNT) {
      list.push(...Array(MAX_DISPLAY_COUNT - list.length).fill(null));
    }

    setBadges(list);
    badgesRef.current = list;
    setLoading(false);
  }, 500);

  const sortBadges = async (newIndex: number, oldIndex: number) => {
    setLoading(true);

    try {
      const fullData = badgesRef.current;
      const oldOrder = fullData[oldIndex]!.display_order;
      fullData[oldIndex]!.display_order = fullData[newIndex]!.display_order;
      fullData[newIndex]!.display_order = oldOrder;
      const list = fullData.filter((item) => !!item) as BadgeItem[];
      const data = list.map((item) => ({
        badge_id: item.badge_id,
        display: !!item.display,
        display_order: item.display_order!,
      }));

      await sortDisplayBadgesAPI(data);
    } catch (error) {
      console.log('Badge Sort Error:', error);
    }

    await queryDisplayBadges();
    setLoading(false);
  };

  useEffect(() => {
    queryDisplayBadges();
  }, [userInfo]);

  return { total, badges, queryDisplayBadges, sortBadges, loading, validCount };
}
