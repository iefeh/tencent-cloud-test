import { KEY_AUTHORIZATION } from '@/constant/storage';
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
  config.headers.Authorization = localStorage.getItem(KEY_AUTHORIZATION) || '';
  return config;
});

axios.interceptors.response.use((res) => {
  if (Math.floor(res.status / 100) !== 2) {
    toast.error(res.statusText);
    return null;
  }

  if (!res.data) return null;

  const data = JSON.parse(res.data);

  if (data.code !== 1) {
    switch (data.code) {
      // token expired
      case -2: {
        const store = useStore();
        store.logout(false);
        break;
      }
    }
    // throw new Error(data.msg);
    toast.error(data.msg);
  }

  return data.data;
}, (error) => {
  toast.error(error);
});

export default axios;
