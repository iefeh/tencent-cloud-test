import PaginationRenderItem from '@/components/LoyaltyProgram/task/PaginationRenderItem';
import { MBHistoryRecord, queryMBHistoryListAPI } from '@/http/services/profile';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { useUserContext } from '@/store/User';
import {
  Listbox,
  ListboxItem,
  Pagination,
  ScrollShadow,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from '@nextui-org/react';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FC, Key, useEffect, useRef, useState } from 'react';

const MBHistoryPage: FC = () => {
  const { userInfo } = useUserContext();
  const router = useRouter();

  const tabs = ['Regular Task', 'Event'];
  const [selectedKey, setSelectedKey] = useState(router.query.tabKey?.toString() || tabs[0]);

  const [items, setItems] = useState<MBHistoryRecord[][]>([]);
  const pagiInfo = useRef<PagiInfo>({ pageIndex: 1, pageSize: 10 });
  const [pagiTotal, setPagiTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  function onSelectionChange(key: Key) {
    const str = key.toString();
    router.replace({ pathname: '/Profile/mbhistory', query: { ...router.query, tabKey: str } }, undefined, {
      scroll: false,
    });
    setSelectedKey(str);
  }

  async function queryItems(pagi = pagiInfo.current) {
    const { pageIndex, pageSize } = pagi;
    const data = { page_num: pageIndex, page_size: pageSize };

    setLoading(true);

    try {
      const res = await queryMBHistoryListAPI(data);
      const { quests, total } = res;
      Object.assign(pagiInfo.current, pagi);
      setPagiTotal(Math.ceil((+total || 0) / pageSize));
      setItems(formatItems(quests || []));
    } catch (error: any) {
      // toast.error(error?.message || error);
      console.log(error);
    }

    setLoading(false);
  }

  function formatItems(data: MBHistoryRecord[]) {
    const list: MBHistoryRecord[][] = [];

    let last: MBHistoryRecord | null = null;
    data.forEach((item) => {
      if (!last || item.name !== last.name) {
        list.push([item]);
        last = last || item;
      } else {
        list[list.length - 1].push(item);
        last = item;
      }
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

  useEffect(() => {
    if (!userInfo) {
      setItems([]);
      setPagiTotal(0);
      Object.assign(pagiInfo.current, { pageIndex: 1, pageSize: 10 });
      return;
    }

    queryItems();
  }, [userInfo]);

  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-12 md:px-32 lg:px-[16.25rem] pt-[9.125rem] pb-[13.5rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>Moon Beams History | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs hrefs={['/Profile']} />

      <div className="mt-8 w-full relative">
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

              <ScrollShadow className="w-full h-[31.375rem] font-poppins-medium">
                <Listbox items={items} classNames={{ base: 'p-0 bg-black' }} label="Moon Beams History">
                  {(list) => (
                    <ListboxItem
                      key={`${list[0].name}_${list[0].quest_id}`}
                      className="rounded-none p-0 !bg-transparent"
                      textValue={list[0].name}
                    >
                      <ul className="text-base text-white transition-colors border-1 border-transparent rounded-base hover:border-basic-yellow">
                        {list.map((item) => (
                          <li
                            key={`${item.quest_id}_${item.created_time}`}
                            className="flex justify-between items-center h-16 text-[#999] px-10 gap-4"
                          >
                            <div className="flex-[428]">{item.name || '--'}</div>
                            <div className="flex-[264]">{item.type || '--'}</div>
                            <div className="flex-[224] text-basic-yellow">{formatMB(item.moon_beam_delta)}</div>
                            <div className="flex-[156]">{formatTime(item.created_time)}</div>
                          </li>
                        ))}
                      </ul>
                    </ListboxItem>
                  )}
                </Listbox>
              </ScrollShadow>

              {items.length > 0 && (
                <Pagination
                  className="flex justify-center"
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

        {loading && <CircularLoading />}
      </div>
    </section>
  );
};

export default observer(MBHistoryPage);
