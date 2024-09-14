import { AxiosRequestConfig } from 'axios';

module 'axios' {
  export interface AxiosRequestConfig {
    hideErrorTips?: boolean;
    withBearer?: boolean;
    isAA?: boolean;
  }
}
