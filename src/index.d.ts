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

interface ItemProps<T = unknown> {
  item?: T | null;
}
interface ModalProps {
  isOpen: boolean;
  onOpen?: () => void;
  onOpenChange?: (val: boolean) => void;
}

interface BasePage {
  noLoading?: boolean;
  hideLoginCloseButton?: boolean;
  getLayout?: (page: ReactNode) => JSX.Element;
}

interface InfoDTO {
  message: string;
  verified?: boolean;
  success?: boolean;
}
