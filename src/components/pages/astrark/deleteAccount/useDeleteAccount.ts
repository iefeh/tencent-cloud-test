import {
  cancelDeleteAccountAPI,
  checkDeleteStatusAPI,
  deleteAccountAPI,
  type AccountStatusDTO,
} from '@/http/services/astrark';
import { useUserContext } from '@/store/User';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function useDeleteAccount() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token, setToken } = useUserContext();
  const [status, setStatus] = useState(-1);
  const [data, setData] = useState<AccountStatusDTO | null>(null);

  async function onContinue() {
    let res = false;

    switch (status) {
      case 0:
        setStatus(1);
        break;
      case 1:
        res = await deleteAccount();
        if (!res) break;
        setStatus(2);
        break;
      case 2:
        res = await cancelDelete();
        if (!res) break;
        setStatus(0);
        break;
    }
  }

  async function deleteAccount() {
    setLoading(true);
    const res = await deleteAccountAPI();
    if (!res?.result && res?.message) {
      toast.error(res.message);
      setLoading(false);
      return false;
    }

    await queryStatus();
    setLoading(false);

    return true;
  }

  async function cancelDelete() {
    setLoading(true);
    const res = await cancelDeleteAccountAPI();
    if (!res?.result && res?.message) {
      toast.error(res.message);
      setLoading(false);
      return false;
    }

    await queryStatus();
    setLoading(false);

    return true;
  }

  async function queryStatus() {
    const res = await checkDeleteStatusAPI();
    setStatus(res?.destruct_request_submitted ? 2 : 0);
    setData(res || null);
  }

  useEffect(() => {
    if (token) {
      queryStatus();
    } else {
      setStatus(0);
    }
  }, [token]);

  useEffect(() => {
    if (!router.query.token) return;
    setToken('Bearer ' + router.query.token);
  }, [router.query.token]);

  return { data, status, loading, onContinue };
}
