import { queryPurchaseOverviewAPI, queryShopInfoAPI } from '@/http/services/astrark';
import { useAAUserContext } from '@/store/AstrarkUser';
import { AstrArk } from '@/types/astrark';
import { useEffect, useState } from 'react';

export default function usePurchaseOverview() {
  const { token } = useAAUserContext();
  const [data, setData] = useState<AstrArk.PurchaseOverviewDTO | null>(null);
  const [loading, setLoading] = useState(false);

  async function queryPurchaseOverview() {
    setLoading(true);

    const res = await queryPurchaseOverviewAPI();
    setData(res || null);

    setLoading(false);
  }

  useEffect(() => {
    if (token) {
      queryPurchaseOverview();
    } else {
      setData(null);
    }
  }, [token]);

  return { loading, data, queryPurchaseOverview };
}
