import { KEY_AUTHORIZATION, KEY_PARTICLE_TOKEN } from '@/constant/storage';
import { startTransition } from 'react';

export default function Auth() {
  startTransition(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token') || '';
    const jwt = query.get('particle_jwt') || '';
    localStorage.setItem(KEY_AUTHORIZATION, token);
    localStorage.setItem(KEY_PARTICLE_TOKEN, jwt);
    window.close();
  });

  return null;
}
