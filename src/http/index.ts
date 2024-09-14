import { KEY_AUTHORIZATION, KEY_AUTHORIZATION_AA } from '@/constant/storage';
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
      // token expired
      case -2: {
        const store = useStore();
        store.logout(false);
        return null;
      }
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
