import { exchangeAuthCodeAPI } from '@/http/services/astrark';
import { useAAUserContext } from '@/store/AstrarkUser';
import { useDisclosure } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function useToken() {
  const { inited, token, getLocalToken, setToken, init } = useAAUserContext();
  const router = useRouter();
  const authDisclosure = useDisclosure();

  async function initToken() {
    const localToken = getLocalToken();
    if (localToken) {
      init();
      return;
    }

    const { authorization_code } = router.query;
    if (!authorization_code) return;

    const res = await exchangeAuthCodeAPI({ authorization_code: authorization_code as string });
    if (res?.access_token) {
      setToken(res.access_token);
    } else {
      authDisclosure.onOpen();
    }
  }

  useEffect(() => {
    initToken();
  }, []);

  useEffect(() => {
    if (!inited || !!token) return;

    authDisclosure.onOpen();
  }, [inited, token]);

  return { authDisclosure };
}
