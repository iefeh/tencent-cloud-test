import { showConfirmModal } from '@/components/common/modal/ConfirmModal';
import { KEY_AUTHORIZATION, KEY_AUTHORIZATION_AA } from '@/constant/storage';
import { ResponseCode } from '@/lib/response/response';
import { useStore } from '@/store';
import { Axios } from 'axios';
import { toast } from 'react-toastify';

const axios = new Axios({
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
});

axios.interceptors.request.use((config) => {
  if (config.responseType === 'json') {
    const { isAA, withBearer } = config;
    const authKey = isAA ? KEY_AUTHORIZATION_AA : KEY_AUTHORIZATION;

    let auth = localStorage.getItem(authKey) || '';
    if (withBearer) auth = 'Bearer ' + auth;
    config.headers.Authorization = auth;
  }
  return config;
});

axios.interceptors.response.use(
  (res) => {
    const { responseType, hideErrorTips } = res.config;
    if (responseType !== 'json') return res;
    if (!res.data) return null;

    let data: any;

    try {
      data = JSON.parse(res.data) || {};
    } catch (error) {
      console.log('Data Parse Error: ', error);
      return data;
    }

    if (data.code === 1 && ~~(res.status / 100) === 2) return data.data;

    switch (data.code) {
      case ResponseCode.ERROR_UNAUTHORIZED:
      case ResponseCode.ERROR_USER_BANNED:
        const store = useStore();
        store.logout(false);

        if (data.code === ResponseCode.ERROR_USER_BANNED) {
          showConfirmModal({
            showCancelBtn: false,
            content: `
              <p class="mt-4">Your account has been <span class="text-pure-red">suspended</span> due to violation of game rules.</p>
              <p class="mt-2">We have zero tolerance for cheating to maintain a fair gaming environment.</p>
              <p class="mt-2">Please contact customer service if you wish to appeal.</p>
            `,
          });
        }
        return null;
    }

    if (!hideErrorTips) {
      let innerData = data.data;

      if (innerData && (!innerData.verified || !innerData.success) && (innerData.message || innerData.tip)) {
        toast.error(innerData.message || innerData.tip);
      } else if (data.msg) {
        toast.error(data.msg);
      }
    }

    return data.data;
  },
  (error) => {
    toast.error(error);
  },
);

export default axios;
