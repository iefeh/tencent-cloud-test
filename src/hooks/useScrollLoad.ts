import BetterScroll from 'better-scroll';
import { useContext, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
import { MobxContext } from '@/pages/_app';

interface LoadOptions<T = unknown> {
  pageSize?: number;
  minCount?: number;
  watchAuth?: boolean;
  queryKey?: string;
  queryFn?: (params: PageQueryDto) => Promise<PageResDTO<T>>;
}

const BASE_OPTIONS: LoadOptions = {
  pageSize: 10,
  minCount: 0,
  queryKey: 'data',
};

export default function useScrollLoad<T>(extraOptions?: LoadOptions<T>) {
  const { userInfo } = useContext(MobxContext);
  const options: LoadOptions<T> = Object.assign({}, BASE_OPTIONS, extraOptions);

  function getBasePageInfo() {
    return { page_num: 1, page_size: options.pageSize! };
  }

  const [data, setData] = useState<(T | null)[]>(Array(options.minCount).fill(null));
  const currenDataRef = useRef<(T | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const isPullingUpRef = useRef(false);
  const pageInfo = useRef<PageQueryDto>(getBasePageInfo());
  const [total, setTotal] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bsRef = useRef<BetterScroll | null>(null);
  const loadFinishedRef = useRef(false);

  function realSetData(val: (T | null)[]) {
    setData((currenDataRef.current = val));
  }

  function resetData() {
    pageInfo.current.page_num = 1;
    setData((currenDataRef.current = []));
  }

  const queryData = throttle(async (isRefresh = false) => {
    if (!options.queryFn) return;

    setLoading(true);
    let list: (T | null)[] = [];
    let totalCount = 0;

    if (isRefresh) {
      pageInfo.current.page_num = 1;
    }

    try {
      const res = await options.queryFn(pageInfo.current);
      list = pageInfo.current.page_num === 1 ? [] : currenDataRef.current.slice();
      if (res?.[options.queryKey!]) {
        list = list.concat(res[options.queryKey!]);
      }
      totalCount = res?.total || 0;
    } catch (error) {}

    loadFinishedRef.current = list.length >= totalCount;

    if (loadFinishedRef.current && list.length < options.minCount!) {
      list = list.concat(Array(options.minCount! - list.length).fill(null));
    }

    realSetData(list);
    setTotal(totalCount);
    setLoading(false);
    setTimeout(() => {
      bsRef.current?.refresh();
    }, 100);
  }, 500);

  const onPullUp = throttle(async () => {
    if (loadFinishedRef.current || isPullingUpRef.current) return;

    isPullingUpRef.current = true;
    pageInfo.current.page_num++;
    await queryData();
    setTimeout(() => {
      bsRef.current?.finishPullUp();
      isPullingUpRef.current = false;
    }, 100);
  }, 500);

  useEffect(() => {
    if (!scrollRef.current) return;

    bsRef.current = new BetterScroll(scrollRef.current, {
      probeType: 3,
      pullUpLoad: true,
      mouseWheel: true,
      scrollbar: true,
      nestedScroll: true,
    });

    bsRef.current.on('pullingUp', onPullUp);

    return () => {
      bsRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!options.watchAuth) return;

    pageInfo.current.page_num = 1;
    if (!userInfo) {
      resetData();
    } else {
      queryData(true);
    }
  }, [userInfo]);

  return {
    scrollRef,
    data,
    total,
    loading,
    resetData,
    queryData,
  };
}
