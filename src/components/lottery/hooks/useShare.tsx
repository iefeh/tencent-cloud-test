import { getTwitterURLAPI } from '@/http/services/lottery';
import { Lottery } from '@/types/lottery';
import { useEffect, useState } from 'react';

export default function useShare(item?: Lottery.Pool | null) {
  const [url, setUrl] = useState('');

  async function getUrl() {
    if (!item) return;
    const res = await getTwitterURLAPI({ lottery_pool_id: item.lottery_pool_id });
    setUrl(res?.postUrl || '');
  }

  useEffect(() => {
    if (!item) return;
    getUrl();
  }, [item]);

  return { url };
}
