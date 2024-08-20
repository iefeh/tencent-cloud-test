import PageDesc from '@/components/common/PageDesc';
import { Tab, Tabs, cn } from '@nextui-org/react';
import Image from 'next/image';
import { type FC, type Key, useState, useEffect, useRef } from 'react';
import usePools from '../hooks/usePools';
import CircularLoading from '@/pages/components/common/CircularLoading';
import EmptyContent from '@/components/common/EmptyContent';
import PoolCard from '../PoolCard';
import CirclePagination from '@/components/common/CirclePagination';
import usePageQuery from '@/hooks/usePageQuery';
import { queryPoolsListAPI } from '@/http/services/lottery';

const PoolListScreen: FC = () => {
  const tabs = [
    {
      name: '',
      label: 'All',
    },
    {
      name: 'in_progress',
      label: 'In Progress',
      content: null,
    },
    {
      name: 'coming_soon',
      label: 'Coming Soon',
    },
    {
      name: 'ended',
      label: 'Ended',
    },
  ];
  const [selectedTab, setSelectedTab] = useState(tabs[0].name);
  const selectedTabRef = useRef(tabs[0].name);
  const {
    pagi,
    loading,
    data: pools,
    queryData,
    total,
  } = usePageQuery({
    key: 'lottery_pools',
    pageSize: 9,
    fn: queryPoolsListAPI,
    notFill: true,
    paramsFn: (pagi) => ({ ...pagi, open_status: selectedTabRef.current }),
  });

  function onSelectionChange(key: Key) {
    pagi.current = { ...pagi.current, page_num: 1 };
    setSelectedTab(key.toString());
    selectedTabRef.current = key.toString();
    queryData();
  }

  function onPageChange(index: number) {
    pagi.current = { ...pagi.current, page_num: index };
    queryData();
  }

  return (
    <div className="relative w-screen pt-[19.5rem] mb-[6.5625rem] flex flex-col justify-center items-center bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_cover.png')] bg-[length:100%_auto] bg-no-repeat z-10">
      <PageDesc
        className="relative z-0"
        needAni
        baseAniTY
        title={
          <div className="text-4xl lg:text-6xl uppercase font-semakin text-center">
            <span className="bg-gradient-to-b to-[#D9A970] from-[#EFEBC5] bg-clip-text text-transparent whitespace-nowrap">
              “More and $MORE”
            </span>
            <br />
            <span>Lottery Pools</span>
          </div>
        }
      />

      <Tabs
        aria-label="Options"
        color="primary"
        variant="underlined"
        selectedKey={selectedTab}
        classNames={{
          base: 'text-white mt-[4.625rem]',
          tabList: 'gap-[0.375rem] w-full relative rounded-none p-0',
          cursor: 'hidden',
          tab: 'max-w-fit h-auto px-5 py-ten bg-transparent from-[#D9A970] to-[#EFEBC5] !rounded-[1.25rem] border-2 border-white data-[selected=true]:py-3 data-[selected=true]:border-0 data-[selected=true]:bg-gradient-to-r',
          tabContent: 'text-white text-base leading-none group-data-[selected=true]:text-black',
          panel: 'p-0',
        }}
        onSelectionChange={onSelectionChange}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.name}
            title={
              <div className="flex items-center space-x-2 px-1">
                <span>{tab.label}</span>
              </div>
            }
          />
        ))}
      </Tabs>

      <div className="w-[87.5rem] max-w-full min-h-[37.5rem] mt-[3.375rem] relative flex flex-col items-center">
        <div className="w-full grid grid-cols-3 gap-x-6 gap-y-8">
          {pools.length > 0 ? pools.map((pool, index) => <PoolCard key={index} item={pool} />) : <EmptyContent />}
        </div>

        <CirclePagination
          key={selectedTab}
          className="mt-20"
          total={Math.ceil(total / 9)}
          page={pagi.current.page_num}
          onChange={onPageChange}
        />

        {loading && <CircularLoading className="z-[1000]" />}
      </div>
    </div>
  );
};

export default PoolListScreen;
