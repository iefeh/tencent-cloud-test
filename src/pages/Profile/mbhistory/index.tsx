import PaginationRenderItem from '@/components/LoyaltyProgram/task/PaginationRenderItem';
import { MBHistoryDetailsRecord, queryMBHistoryDetailsListAPI } from '@/http/services/profile';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { useUserContext } from '@/store/User';
import { Listbox, ListboxItem, Pagination, ScrollShadow, Tab, Tabs, Tooltip } from '@nextui-org/react';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, Key, useEffect, useRef, useState } from 'react';
import teamsImg from 'img/loyalty/task/teams.png';

const MBHistoryPage: FC = () => {
  const { userInfo } = useUserContext();
  const router = useRouter();

  const [tabs, setTabs] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState(router.query.tabKey?.toString() || tabs[0]);

  const [items, setItems] = useState<MBHistoryDetailsRecord[][]>([]);
  const pagiInfo = useRef<PagiInfo>({ pageIndex: 1, pageSize: 10 });
  const [pagiTotal, setPagiTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  function onSelectionChange(key: Key) {
    const str = key.toString();
    setSelectedKey(str);
    initData();
    queryItems(pagiInfo.current, str);
  }

  async function queryItems(pagi = pagiInfo.current, tab = selectedKey) {
    const { pageIndex, pageSize } = pagi;
    const data = { page_num: pageIndex, page_size: pageSize, tab };

    setLoading(true);

    try {
      const res = await queryMBHistoryDetailsListAPI(data);
      const { items, total, tabs, current_tab } = res;

      if (!selectedKey) {
        setTabs(tabs || []);
        setSelectedKey(current_tab || tabs[0] || '');
      }

      Object.assign(pagiInfo.current, pagi);
      setPagiTotal(Math.ceil((+total || 0) / pageSize));
      setItems(formatItems(items || []));
    } catch (error: any) {
      console.log(error);
    }

    setLoading(false);
  }

  function formatItems(data: MBHistoryDetailsRecord[]) {
    const list: MBHistoryDetailsRecord[][] = [];

    let last: MBHistoryDetailsRecord | null = null;
    data.forEach((item) => {
      if (!last || item.item !== last.item) {
        list.push([item]);
      } else {
        list[list.length - 1].push(item);
      }

      last = item;
    });

    return list;
  }

  function formatTime(time: number) {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
  }

  function onPagiChange(page: number) {
    if (page === pagiInfo.current.pageIndex) return;

    const pagi = { ...pagiInfo.current, pageIndex: page };
    queryItems(pagi);
  }

  function formatMB(value: number) {
    return `+ ${value || 0} MB`;
  }

  function initData() {
    setItems([]);
    setPagiTotal(0);
    Object.assign(pagiInfo.current, { pageIndex: 1, pageSize: 10 });
  }

  useEffect(() => {
    if (!userInfo) {
      initData();
      return;
    }

    queryItems();
  }, [userInfo]);

  const emptyContent = (
    <div className="absolute inset-0 backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-[999] flex flex-col justify-center items-center font-poppins text-2xl pointer-events-none">
      <p>No history found.</p>
      <Image className="w-[54rem] h-auto" src={teamsImg} alt="" />
    </div>
  );

  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-12 md:px-32 lg:px-[16.25rem] pt-[9.125rem] pb-[13.5rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>Moon Beams History | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs hrefs={['/Profile']} />

      <div className="mt-8 min-h-[32rem] w-full relative">
        {tabs.length > 0 && (
          <Tabs
            aria-label="Options"
            color="primary"
            variant="underlined"
            selectedKey={selectedKey}
            classNames={{
              base: 'w-full',
              tabList: 'gap-6 w-full relative rounded-none p-0',
              cursor: 'w-full bg-basic-yellow',
              tab: 'max-w-fit px-0 h-12 font-semakin',
              tabContent: 'text-white text-xl group-data-[selected=true]:text-basic-yellow',
              panel: 'p-0',
            }}
            onSelectionChange={onSelectionChange}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab}
                title={
                  <div className="flex items-center space-x-2">
                    <span>{tab}</span>
                  </div>
                }
              >
                <ul className="w-full flex justify-between items-center h-16 bg-[#111111] text-[#999] px-10 gap-4">
                  <li className="flex-[428]">Item</li>
                  <li className="flex-[264]">Reward Type</li>
                  <li className="flex-[224]">Moon Beams</li>
                  <li className="flex-[156]">Time</li>
                </ul>

                <ScrollShadow className="w-full h-[31.375rem] font-poppins-medium relative">
                  <Listbox items={items} classNames={{ base: 'p-0 bg-black' }} label="Moon Beams History">
                    {(list) => (
                      <ListboxItem
                        key={Math.random().toString()}
                        className="rounded-none p-0 !bg-transparent"
                        textValue={list[0].item}
                      >
                        <Tooltip content={<div className="max-w-[28rem] px-4 py-2">{list[0].item}</div>}>
                          <ul className="text-base text-white transition-colors border-1 border-transparent rounded-base hover:border-basic-yellow">
                            {list.map((item) => (
                              <li
                                key={`${item.quest_id}_${item.created_time}`}
                                className="flex justify-between items-center h-16 text-[#999] px-10 gap-4"
                              >
                                <div className="flex-[428] whitespace-nowrap text-ellipsis overflow-hidden">
                                  {item.item || '--'}
                                </div>
                                <div className="flex-[264] whitespace-nowrap text-ellipsis overflow-hidden">
                                  {item.type || '--'}
                                </div>
                                <div className="flex-[224] text-basic-yellow">{formatMB(item.moon_beam_delta)}</div>
                                <div className="flex-[156]">{formatTime(item.created_time)}</div>
                              </li>
                            ))}
                          </ul>
                        </Tooltip>
                      </ListboxItem>
                    )}
                  </Listbox>

                  {loading && !!selectedKey && <CircularLoading />}

                  {!loading && items.length < 1 && emptyContent}
                </ScrollShadow>

                {items.length > 0 && (
                  <Pagination
                    className="flex justify-center mt-8"
                    showControls
                    total={pagiTotal}
                    initialPage={1}
                    renderItem={PaginationRenderItem}
                    classNames={{
                      wrapper: 'gap-3',
                      item: 'w-12 h-12 font-poppins-medium text-base text-white',
                    }}
                    disableCursorAnimation
                    radius="full"
                    variant="light"
                    onChange={onPagiChange}
                  />
                )}
              </Tab>
            ))}
          </Tabs>
        )}

        {loading && !selectedKey && <CircularLoading />}

        {!loading && tabs.length < 1 && emptyContent}
      </div>
    </section>
  );
};

export default observer(MBHistoryPage);
