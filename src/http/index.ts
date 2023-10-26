import { KEY_AUTHORIZATION } from '@/constant/storage';
import { Axios } from 'axios';

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

  console.log(23424, res.data);
  const data = JSON.parse(res.data);

  if (data.code !== 1) {
    throw new Error(data.msg);
  }

  return data.data;
});

export default axios;
