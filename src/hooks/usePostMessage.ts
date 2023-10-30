import { KEY_EMAIL } from '@/constant/storage';
import { MobxContext } from '@/pages/_app';
import { useContext, useEffect } from 'react';

const KEY_QUICK_FILL = '__quick_fill_code__';

export function setQuickFillCode(code: string) {
  localStorage.setItem(KEY_QUICK_FILL, code);
}

export default function usePostMessage() {
  const store = useContext(MobxContext);

  async function listen(e: StorageEvent) {
    const email = localStorage.getItem(KEY_EMAIL) || '';
    const code = localStorage.getItem(KEY_QUICK_FILL) || '';
    if (!email || !code) return;

    try {
      await store.loginByEmail({ email, captcha: code });
      localStorage.removeItem(KEY_EMAIL);
    } catch (error: any) {
      console.log(error);
    } finally {
      localStorage.removeItem(KEY_QUICK_FILL);
    }
  }

  useEffect(() => {
    window.addEventListener('storage', listen);

    return () => window.removeEventListener('storage', listen);
  }, []);
}
