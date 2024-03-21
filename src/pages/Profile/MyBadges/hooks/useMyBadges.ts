import { BadgeItem, claimBadgeAPI, mintBadgeAPI, queryBadgesPageListAPI } from '@/http/services/badges';
import { MobxContext } from '@/pages/_app';
import { throttle } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

export default function useMyBadges() {
  const MIN_TOTAL = 36;
  const { userInfo } = useContext(MobxContext);
  const pagi = useRef<PageQueryDto>({ page_num: 1, page_size: MIN_TOTAL });
  const [total, setTotal] = useState(0);
  const [badges, setBadges] = useState<Array<BadgeItem | null>>(Array(MIN_TOTAL).fill(''));
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoaing] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);

  const queryMyBadges = throttle(async (condition?: Partial<PageQueryDto>) => {
    setLoading(true);
    const params = Object.assign({}, pagi.current, condition);

    const res = await queryBadgesPageListAPI(params);
    const list = res?.badges || [];

    if (list.length < MIN_TOTAL) {
      list.push(...Array(MIN_TOTAL - list.length).fill(null));
    }

    setTotal(res?.claimed_count || 0);

    setBadges(list);
    Object.assign({ page_num: res?.page_num || 0, page_size: res?.page_size });
    setLoading(false);
  }, 500);

  const claimBadge = throttle(async (item: BadgeItem) => {
    setClaimLoaing(true);
    let lv = 1;

    if (item.has_series) {
      item.series?.forEach((serie) => {
        if (!serie.obtained_time || serie.lv <= lv) return;
        lv = serie.lv;
      });
    } else {
      lv = item.lv || 1;
    }

    const res = await claimBadgeAPI({ badge_id: item.badge_id, badge_lv: lv });
    if (res) {
      if (res.result) {
        toast.success(res.result);
      }
      await queryMyBadges();
    }
    setClaimLoaing(false);
  }, 500);

  const mintBadge = throttle(async (id: string) => {
    setMintLoading(true);
    const res = await mintBadgeAPI(id);
    if (res) {
      await queryMyBadges();
    }
    setMintLoading(false);
  }, 500);

  useEffect(() => {
    queryMyBadges();
  }, [userInfo]);

  return { total, badges, queryMyBadges, claimBadge, mintBadge, loading, claimLoading, mintLoading };
}
