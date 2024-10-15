import { RechargeDTO, queryTestRechargeAPI } from '@/http/services/astrark';
import { useUserContext } from '@/store/User';
import { useEffect, useState } from 'react';

export default function useQuery() {
  const [info, setInfo] = useState<RechargeDTO | null>(null);
  const { token } = useUserContext();

  async function queryRetrunInfo() {
    const res = await queryTestRechargeAPI();
    setInfo(res || null);
  }

  useEffect(() => {
    if (token) {
      queryRetrunInfo();
    } else {
      setInfo(null);
    }
  }, [token]);

  return { info };
}
