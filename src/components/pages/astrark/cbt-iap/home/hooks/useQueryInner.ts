import { RechargeDTO, queryTestRechargeInnerAPI } from '@/http/services/astrark';
import { useAAUserContext } from '@/store/AstrarkUser';
import { useEffect, useState } from 'react';

export default function useQuery() {
  const [canView, setCanView] = useState(false);
  const [info, setInfo] = useState<RechargeDTO | null>(null);
  const { token } = useAAUserContext();

  async function queryRetrunInfo() {
    const res = await queryTestRechargeInnerAPI();
    setInfo(res || null);
    setCanView(true);
  }

  useEffect(() => {
    if (!token) return;

    queryRetrunInfo();
  }, [token]);

  return { canView, info };
}
