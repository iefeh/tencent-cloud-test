import { getTwitterURLAPI } from '@/http/services/lottery';
import { Lottery } from '@/types/lottery';
import { useState } from 'react';

export default function useShare() {
  const [url, setUrl] = useState('');

  async function getUrl(item?: Lottery.Pool | null, reward?: Lottery.DrawDTO | Lottery.RewardResDTO | null) {
    if (!item || !reward) return '';
    const res = await getTwitterURLAPI({ lottery_pool_id: item.lottery_pool_id, draw_id: reward.draw_id });
    const url = res?.postUrl || '';
    setUrl(url);
    return url;
  }

  return { url, getUrl };
}
