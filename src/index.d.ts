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

interface PageResDTO<T> {
  total: number;
  page_num: string;
  page_size: string;
  [key: string]: T[] | null;
}

interface Dict<T> {
  [key: string]: T;
}

interface PagiInfo {
  total?: number;
  pageIndex: number;
  pageSize: number;
}

interface ClassNameProps {
  className?: string;
}

interface ModalProps {
  isOpen: boolean;
  onOpen?: () => void;
  onOpenChange?: (val: boolean) => void;
}
