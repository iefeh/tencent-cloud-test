import { KEY_EMAIL } from '@/constant/storage';
import { setQuickFillCode } from '@/hooks/usePostMessage';
import { useEffect, useState } from 'react';

export default function Quickfill() {
  const [text, setText] = useState('Connecting. . .');

  useEffect(() => {
    const email = localStorage.getItem(KEY_EMAIL);
    if (!email) {
      setText('Some error occurred.');
      return;
    }

    const query = new window.URLSearchParams(location.search);
    setQuickFillCode(query.get('code') || '');
    setText('Trying to login to Moonveil Entertainment. . .');

    function onLogin() {
      const curEmail = localStorage.getItem(KEY_EMAIL);
      if (curEmail) return;
      setText('You have logged in. Please close this window.');
    }

    window.addEventListener('storage', onLogin);
    return () => window.removeEventListener('storage', onLogin);
  }, []);

  return <div className="w-screen h-screen flex justify-center items-center">{text}</div>;
}
