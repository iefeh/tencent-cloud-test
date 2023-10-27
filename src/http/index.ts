import { useStore } from '@/store';
import { Axios } from 'axios';

const axios = new Axios({
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
});

axios.interceptors.request.use((config) => {
  const store = useStore();
  config.headers.Authorization = store.token || '';
  return config;
});

axios.interceptors.response.use((res) => {
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
    throw new Error(data.msg);
  }

  return data.data;
});

export default axios;
