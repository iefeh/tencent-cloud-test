import useCheckRouter from '../common/useCheckRouter';
import { checkNoviceNotchAPI } from '@/http/services/profile';
import { showNoviceNoticeModal } from '@/components/common/modal/NoviceNoticeModal';
import { KEY_AUTHORIZATION } from '@/constant/storage';
import { useEffect } from 'react';
import { throttle } from 'lodash';

const checkNovice = throttle(async () => {
  const res = await checkNoviceNotchAPI({});
  if (!res?.is_alert) return;

  showNoviceNoticeModal();
}, 300);

export default function useCheckNoviceBadge() {
  const { isInWhiteList } = useCheckRouter();

  useEffect(() => {
    const token = localStorage.getItem(KEY_AUTHORIZATION);
    if (isInWhiteList || !token) return;

    checkNovice();
  }, []);
}
