import { getTwitterURLAPI } from '@/http/services/lottery';
import { Lottery } from '@/types/lottery';
import { useEffect, useState } from 'react';

export default function useShare(item?: Lottery.Pool | null, reward?: Lottery.DrawDTO | Lottery.RewardResDTO | null) {
  const [url, setUrl] = useState('');

  async function getUrl() {
    if (!item || !reward) return;
    const res = await getTwitterURLAPI({ lottery_pool_id: item.lottery_pool_id, draw_id: reward.draw_id });
    setUrl(res?.postUrl || '');
  }

  useEffect(() => {
    setUrl('');
    if (!item) return;
    getUrl();
  }, [item, reward]);

  return { url };
}
