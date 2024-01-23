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

interface WorldTime {
  abbreviation: string;
  client_ip: string;
  datetime: string;
  day_of_week: number;
  day_of_year: number;
  dst: boolean;
  raw_offset: boolean;
  timezone: string;
  unixtime: number;
  utc_datetime: string;
  utc_offset: string;
  week_number: number;
}
