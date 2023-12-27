import { MutableRefObject } from 'react';
import { useEffect } from 'react';

export default function useConnectDialog(dialog: MutableRefObject<Window | null>, callback?: (args?: any) => void) {
  function authLogin() {
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
