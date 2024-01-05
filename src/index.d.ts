interface Window {
  google: any;
  twttr: any;
  luxy: any;
}

declare module 'luxy.js';

interface QuickfillDto {
  code: string;
}

interface PageQueryDto {
  page_num: number;
  page_size: number;
}

interface Dict<T> {
  [key: string]: T;
}

interface PagiInfo {
  total?: number;
  pageIndex: number;
  pageSize: number;
}
