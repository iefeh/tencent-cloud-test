import { useAAUserContext } from '@/store/AstrarkUser';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function useToken() {
  const { setToken, init } = useAAUserContext();
  const router = useRouter();

  useEffect(() => {
    const { authorization_code } = router.query;

    if (authorization_code) {
      setToken(authorization_code as string);
    }

    init();
  }, []);
}
