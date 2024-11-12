import useCheckRouter from '../common/useCheckRouter';
import { checkNoviceNotchAPI } from '@/http/services/profile';
import { showNoviceNoticeModal } from '@/components/common/modal/NoviceNoticeModal';
import { useEffect } from 'react';
import { throttle } from 'lodash';
import { useUserContext } from '@/store/User';

const checkNovice = throttle(async () => {
  const res = await checkNoviceNotchAPI({});
  if (!res?.is_alert) return;

  showNoviceNoticeModal();
}, 300);

export default function useCheckNoviceBadge() {
  const { token } = useUserContext();
  const { isInWhiteList } = useCheckRouter();

  useEffect(() => {
    if (isInWhiteList || !token) return;

    checkNovice();
  }, [token]);
}
