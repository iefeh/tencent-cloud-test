import { exchangeAuthCodeAPI } from '@/http/services/astrark';
import { useAAUserContext } from '@/store/AstrarkUser';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function useToken() {
  const { setToken, init } = useAAUserContext();
  const router = useRouter();

  async function initToken() {
    const initRes = init();
    if (initRes) return;

    const { authorization_code } = router.query;
    if (!authorization_code) return;

    const res = await exchangeAuthCodeAPI({ authorization_code: authorization_code as string });
    if (res?.access_token) {
      setToken(res.access_token);
    }
  }

  useEffect(() => {
    initToken();
  }, []);
}
