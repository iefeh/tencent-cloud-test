import { ASSETS_PAGE_SIZE } from '@/constant/nft';
import { useEffect, useRef, useState } from 'react';

interface Props<T, P> {
  key: string;
  notFill?: boolean;
  fn: (params: P) => Promise<PageResDTO<T>>;
  paramsFn?: (pagi: P) => unknown;
}

export default function usePageQuery<T, P = PageQueryDto>({ key, notFill, fn, paramsFn }: Props<T, P>) {
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<T[]>([]);
  const pagi = useRef<P>({ page_num: 1, page_size: ASSETS_PAGE_SIZE } as P);

  async function queryData() {
    setLoading(true);

    const params = paramsFn ? Object.assign({}, pagi.current, paramsFn(pagi.current)) : pagi.current;
    const res = await fn(params);
    let list = res?.[key] || [];
    if (!notFill && list.length < ASSETS_PAGE_SIZE) {
      list.push(...Array(ASSETS_PAGE_SIZE - list.length).fill(null));
    }
    setData(list);
    setTotal(res?.total || 0);
    setLoading(false);
  }

  function onPageChange(params: Partial<P>) {
    const data = Object.assign({}, pagi.current, params) as any;
    const { page_num, page_size } = pagi.current as any;
    if (data.page_num === page_num && data.page_size === page_size) return;

    pagi.current = data;
    queryData();
  }

  useEffect(() => {
    queryData();
  }, []);

  return { loading, data, total, pagi, onPageChange, queryData, setData };
}
