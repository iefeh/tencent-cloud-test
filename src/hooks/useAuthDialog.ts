import { useContext, MutableRefObject } from 'react';
import { KEY_AUTHORIZATION, KEY_PARTICLE_TOKEN } from './../constant/storage';
import { useEffect } from 'react';
import { MobxContext } from '@/pages/_app';

export default function useAuthDialog(dialog: MutableRefObject<Window | null>, callback?: () => void) {
  const store = useContext(MobxContext);

  function authLogin() {
    const token = localStorage.getItem(KEY_AUTHORIZATION);
    const jwt = localStorage.getItem(KEY_PARTICLE_TOKEN);
    if (!token) return;

    store.token = token;
    store.jwtToken = jwt || '';
    store.loginParticle();
    store.getUserInfo().catch(() => void 0);
    if (!dialog.current) return;
    dialog.current.close();
    dialog.current = null;
    callback?.();
  }

  useEffect(() => {
    window.addEventListener('storage', authLogin);
    return () => window.removeEventListener('storage', authLogin);
  }, []);
}
