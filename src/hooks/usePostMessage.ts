import { useEffect } from 'react';

const KEY_QUICK_FILL = '__quick_fill_code__';

export function setQuickFillCode(code: string) {
  localStorage.setItem(KEY_QUICK_FILL, code);
}

export default function usePostMessage() {
  function listen(e: StorageEvent) {
    const code = localStorage.getItem(KEY_QUICK_FILL);
    console.log(code);
    localStorage.removeItem(KEY_QUICK_FILL);
  }

  useEffect(() => {
    window.addEventListener('storage', listen);

    return () => window.removeEventListener('storage', listen);
  }, []);
}
