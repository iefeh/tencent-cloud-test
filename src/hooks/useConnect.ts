import { useEffect, useRef, useState } from 'react';
import { MediaType } from '@/constant/task';
import { connectMediaAPI } from '@/http/services/login';
import { toast } from 'react-toastify';
import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import { useWeb3Modal } from '@web3modal/ethers/react';

export default function useConnect(type: string, callback?: (args?: any) => void) {
  const dialogWindowRef = useRef<Window | null>(null);
  const { open } = useWeb3Modal();
  const [loading, setLoading] = useState(false);

  function authConnect() {
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_CONNECT) || {};
    if (!tokens[type]) return;
    dialogWindowRef.current?.close();
    dialogWindowRef.current = null;
    const { code, msg } = tokens[type] || {};
    if (+code === 1) {
      callback?.();
    } else {
      toast.error(msg);
    }
    delete tokens[type];
    localStorage.save(KEY_AUTHORIZATION_CONNECT, tokens);
  }

  function openAuthWindow(authURL: string) {
    const dialog = window.open(
      authURL,
      'Authrization',
      'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
    );
    dialogWindowRef.current = dialog;
    dialog?.addEventListener('close', () => {
      dialogWindowRef.current = null;
    });
  }

  async function onConnect() {
    if (type === MediaType.METAMASK) {
      open();
      return;
    }

    setLoading(true);
    const res = await connectMediaAPI(type);
    if (!res?.authorization_url) {
      toast.error('Get authorization url failed!');
      setLoading(false);
      return;
    }

    openAuthWindow(res.authorization_url);
    setLoading(false);
  }

  useEffect(() => {
    window.addEventListener('storage', authConnect);
    return () => window.removeEventListener('storage', authConnect);
  }, []);

  return { onConnect, loading };
}
