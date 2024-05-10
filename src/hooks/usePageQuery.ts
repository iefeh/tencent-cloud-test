import { useEffect, useRef, useState } from 'react';

interface Props<T, P> {
  key: string;
  fn: (params: P) => Promise<PageResDTO<T>>;
}

export default function usePageQuery<T, P = PageQueryDto>({ key, fn }: Props<T, P>) {
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<T[]>([]);
  const pagi = useRef<P>({ page_num: 1, page_size: 10 } as P);

  async function queryData() {
    setLoading(true);
    const res = await fn(pagi.current);
    setData(res[key] || []);
    setTotal(res.total || 0);
    setLoading(false);
  }

  function onPageChange(params: P) {
    pagi.current = params;
    queryData();
  }

  useEffect(() => {
    queryData();
  }, []);

  return { loading, data, total, onPageChange };
}
