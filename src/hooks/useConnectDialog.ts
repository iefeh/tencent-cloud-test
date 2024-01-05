import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import { MutableRefObject } from 'react';
import { useEffect } from 'react';

export default function useConnectDialog(dialog: MutableRefObject<Window | null>, type: string, callback?: (args?: any) => void) {
  function authLogin() {
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_CONNECT) || {};
    if (!tokens[type]) return;
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
