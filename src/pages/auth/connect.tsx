import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import { useEffect } from 'react';

export default function Auth() {
  useEffect(() => {
    const localStorage: Storage = window.opener?.localStorage || window.localStorage;
    const query = new URLSearchParams(location.search);
    const type = query.get('type') || '';
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_CONNECT) || {};
    const obj: Dict<string> = {};
    query.forEach((v, k) => {
      obj[k] = v;
    });
    tokens[type] = obj;
    localStorage.save(KEY_AUTHORIZATION_CONNECT, tokens);

    setTimeout(() => {
      window.close();
    }, 300);
  }, []);

  return null;
}
