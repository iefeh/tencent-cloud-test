import { useContext, MutableRefObject } from 'react';
import { KEY_AUTHORIZATION } from './../constant/storage';
import { useEffect } from 'react';
import { MobxContext } from '@/pages/_app';

export default function useAuthDialog(dialog: MutableRefObject<Window | null>) {
  const store = useContext(MobxContext);

  function authLogin() {
    const token = localStorage.getItem(KEY_AUTHORIZATION);
    if (!token) return;

    store.token = token;
    store.getUserInfo();
    if (!dialog.current) return;
    dialog.current.close();
    dialog.current = null;
  }

  useEffect(() => {
    window.addEventListener('storage', authLogin);
    return () => window.removeEventListener('storage', authLogin);
  }, []);
}