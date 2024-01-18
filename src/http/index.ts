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
  if (!res.data) return null;

  let data: any;

  try {
    data = JSON.parse(res.data);
  } catch (error) {
    console.log('Data Parse Error: ', error);
    return data;
  }

  if (data.code !== 1) {
    switch (data.code) {
      // token expired
      case -2: {
        const store = useStore();
        store.logout(false);
        break;
      }
    }
    if (data.msg) {
      toast.error(data.msg);
    }
    
    if (Math.floor(res.status / 100) !== 2 && data.msg) {
      toast.error(data.msg);
      return data;
    } else {
      return Promise.reject(data);
    }
  }

  return data.data;
}, (error) => {
  toast.error(error);
});

export default axios;
