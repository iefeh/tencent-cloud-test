import BetterScroll, { Options } from 'better-scroll';
import { useContext, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
import { MobxContext } from '@/pages/_app';

interface LoadOptions<T = unknown> {
  pageSize?: number;
  minCount?: number;
  watchAuth?: boolean;
  bsOptions?: Options;
  pullupLoad?: boolean;
  queryKey?: string;
  queryFn?: (params: PageQueryDto) => Promise<PageResDTO<T>>;
  paramsFn?: () => unknown;
}

const BASE_OPTIONS: LoadOptions = {
  pageSize: 10,
  minCount: 0,
  pullupLoad: true,
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

  const queryData = throttle(async (isRefresh = false, noLoading = false) => {
    if (!options.queryFn) return;

    if (!noLoading) setLoading(true);
    let list: (T | null)[] = [];
    let totalCount = 0;

    if (isRefresh) {
      pageInfo.current.page_num = 1;
    }

    try {
      const params = options.paramsFn ? Object.assign({}, pageInfo.current, options.paramsFn()) : pageInfo.current;
      const res = await options.queryFn(params);
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

  function refreshScroll() {
    if (!scrollRef.current) return;
    try {
      bsRef.current?.refresh();
    } catch (error) {}
  }

  useEffect(() => {
    if (!scrollRef.current) return;

    if (bsRef.current) {
      bsRef.current.destroy();
    }

    const bsOptions = Object.assign(
      {
        probeType: 3,
        pullUpLoad: true,
        mouseWheel: true,
        scrollbar: true,
        nestedScroll: true,
      },
      options.bsOptions,
    );
    const bs = new BetterScroll(scrollRef.current, bsOptions);
    bsRef.current = bs;

    if (options.pullupLoad) {
      bs.on('pullingUp', onPullUp);
    }

    return () => {
      bs.destroy();
      bsRef.current = null;
    };
  }, [data]);

  useEffect(() => {
    if (!scrollRef.current) return;
    refreshScroll();
  }, [data]);

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
    refreshScroll,
  };
}
