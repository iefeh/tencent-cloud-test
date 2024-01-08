import { KEY_AUTHORIZATION, KEY_AUTHORIZATION_AUTH, KEY_PARTICLE_TOKEN } from '@/constant/storage';
import { useEffect } from 'react';

export default function Auth() {
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token') || '';
    const jwt = query.get('particle_jwt') || '';
    localStorage.setItem(KEY_AUTHORIZATION, token);
    localStorage.setItem(KEY_PARTICLE_TOKEN, jwt);

    const type = query.get('type') || '';
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_AUTH) || {};
    const obj: Dict<string> = {};
    query.forEach((v, k) => {
      obj[k] = v;
    });
    tokens[type] = obj;
    localStorage.save(KEY_AUTHORIZATION_AUTH, tokens);

    window.close();
  }, []);

  return null;
}
