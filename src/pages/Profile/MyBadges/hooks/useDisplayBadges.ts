import { BadgeItem, queryDisplayBadgesAPI } from '@/http/services/badges';
import { MobxContext } from '@/pages/_app';
import { throttle } from 'lodash';
import { useContext, useEffect, useState } from 'react';

export default function useDisplayBadges() {
  const MIN_TOTAL = 5;
  const { userInfo } = useContext(MobxContext);
  const [badges, setBadges] = useState<Array<BadgeItem | null>>(Array(36).fill(''));

  const queryDisplayBadges = throttle(async () => {
    if (!userInfo) {
      setBadges(Array(MIN_TOTAL).fill(null));
      return;
    }

    const res = await queryDisplayBadgesAPI();
    const list = res || [];

    if (list.length < MIN_TOTAL) {
      list.push(...Array(MIN_TOTAL - list.length).fill(null));
    }

    setBadges(list);
  }, 500);

  useEffect(() => {
    queryDisplayBadges();
  }, [userInfo]);

  return { badges, queryDisplayBadges };
}
