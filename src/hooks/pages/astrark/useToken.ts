import { KEY_AUTH_CODE_AA } from '@/constant/storage';
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
    const localCode = localStorage.getItem(KEY_AUTH_CODE_AA);
    const sp = new URLSearchParams(router.asPath.match(/\?.*/)?.[0] || '');
    const authorization_code = sp.get('authorization_code');

    if (localToken && authorization_code && authorization_code === localCode) {
      init();
      return;
    }

    if (!authorization_code) return;

    const res = await exchangeAuthCodeAPI({ authorization_code: authorization_code as string });
    if (res?.access_token) {
      localStorage.setItem(KEY_AUTH_CODE_AA, authorization_code);
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
